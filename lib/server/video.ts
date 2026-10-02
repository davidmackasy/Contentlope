import {AppError,config,run,uid,now,json,requireContent} from './db';
import {publicFetch} from './security';

// Custom provider contract: POST /generate -> {id}; GET /jobs/:id ->
// {status:'pending'|'processing'|'completed'|'failed', output_url?, error?}.
export async function checkVideo(userId:string, content:any){
  if(content.type!=='video')throw new AppError('This is not a video.',400);
  if(content.metadata.output_asset_id||content.metadata.video_status==='failed')return content;
  const settings=config(), job=content.metadata.provider_job_id;
  if(!job||!settings.AI_VIDEO_BASE_URL||!settings.AI_VIDEO_API_KEY)throw new AppError('No video rendering job is connected.',503);
  const result=await fetch(settings.AI_VIDEO_BASE_URL.replace(/\/$/,'')+'/jobs/'+encodeURIComponent(job),{headers:{Authorization:`Bearer ${settings.AI_VIDEO_API_KEY}`},signal:AbortSignal.timeout(30000)});
  if(!result.ok)throw new AppError('The video provider status is temporarily unavailable.',502);
  const data:any=await result.json();
  const meta={...content.metadata,video_status:data.status};
  let status=content.status;
  if(data.status==='failed'){status='draft';meta.video_error=String(data.error||'The video provider could not render this video.').slice(0,500)}
  else if(data.status==='completed'){
    if(!data.output_url||!settings.BUCKET)throw new AppError('The provider returned no downloadable video.',502);
    const media=await publicFetch(data.output_url);if(!media.ok)throw new AppError('Video output could not be downloaded.',502);
    if(Number(media.headers.get('content-length'))>100*1024*1024)throw new AppError('The rendered video exceeds the 100 MB limit.',413);
    const reader=media.body?.getReader();if(!reader)throw new AppError('The video output is empty.',502);
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>100*1024*1024){await reader.cancel();throw new AppError('The rendered video exceeds the 100 MB limit.',413)}chunks.push(part.value)}
    const bytes=new Uint8Array(size);let position=0;for(const chunk of chunks){bytes.set(chunk,position);position+=chunk.length}
    if(size<12||String.fromCharCode(...bytes.slice(4,8))!=='ftyp')throw new AppError('The provider output is not a supported MP4 video.',502);
    const id=uid(),path=`private/businesses/${content.business_id}/assets/${id}`;
    await settings.BUCKET.put(path,bytes,{httpMetadata:{contentType:'video/mp4'}});
    await run('INSERT INTO assets (id,business_id,name,category,mime,path,size,source,metadata,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',id,content.business_id,content.title+'.mp4','Generated','video/mp4',path,size,'generated',json({provider_job_id:job}),now());
    meta.output_asset_id=id;status='draft';
  }else if(!['pending','processing'].includes(data.status))throw new AppError('The provider returned an unsupported job state.',502);
  await run('UPDATE content_packages SET metadata=?,status=?,updated_at=? WHERE id=?',json(meta),status,now(),content.id);
  return requireContent(userId,content.id);
}
