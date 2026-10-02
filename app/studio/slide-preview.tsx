'use client';
import {useEffect} from 'react';
import type {Slide,Business} from '@/lib/types';
import {templateColors} from '@/lib/render';
import {presentation,contrastColor} from '@/lib/slide-design';
import {loadBrandFonts} from '@/lib/brand-fonts';
export default function SlidePreview({slide,business,index=0,total=5,mini=false}:{slide:Slide;business:Business;index?:number;total?:number;mini?:boolean}){
 const colors=templateColors(slide.template_id,business.kit),p=presentation(slide);
 useEffect(()=>{loadBrandFonts(business.kit)},[business.kit]);
 const color=slide.text_color||(p.photo&&slide.layout!=='split'?'#ffffff':contrastColor(colors.bg));
 return <div className={'slide-preview native-slide '+(mini?'mini ':'')+(p.photo?'has-photo ':'')+(slide.layout==='split'?'split ':'')+'text-'+p.position+' style-'+p.style} style={{background:colors.bg,color,aspectRatio:`1080/${slide.canvas.height}`}}>
 {p.photo&&<img className="slide-photo" src={'/api/assets/'+slide.asset_id+'/optimized'} alt="" style={{objectPosition:`${slide.crop_x}% ${slide.crop_y}%`}}/>}
 {p.photo&&p.shade>0&&<div className="slide-shade" style={{background:`rgba(0,0,0,${p.shade})`}}/>}
 {p.showBrand&&<div className="slide-brand"><span>{business.name}</span>{business.kit.logo_asset_id&&<img src={'/api/assets/'+business.kit.logo_asset_id+'/file'} alt="Brand logo"/>}</div>}
 <div className="slide-text" style={{textAlign:slide.align}}><h3 style={{fontFamily:p.photo?'Arial, sans-serif':business.kit.heading_font||'Arial',fontSize:`${p.headlineSize}cqw`,fontWeight:p.weight,color,lineHeight:p.photo?1.13:1.02,letterSpacing:p.photo?'-.035em':'-.055em',WebkitTextStroke:p.style==='outlined'?`${p.photo ? 0.5 : 0.65}cqw #111`:undefined,paintOrder:'stroke fill'}}><span>{slide.headline}</span></h3>{p.showBody&&slide.supporting_text&&<p style={{fontSize:`${p.bodySize}cqw`,color,fontFamily:business.kit.body_font||'Arial'}}>{slide.supporting_text}</p>}</div>
 {slide.cta&&<div className="slide-cta" style={{color,textAlign:slide.align}}><span>{slide.cta}</span></div>}
 <div className="slide-footer"><span/><span>{index+1}/{total}</span></div>
 </div>
}
