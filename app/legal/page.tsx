'use client';
import {useEffect,useState} from 'react';
import PolicyPage from '../policy-page';
import {policies} from '@/lib/policies';
export default function Legal(){const[policy,setPolicy]=useState('terms');useEffect(()=>{const tab=new URLSearchParams(location.search).get('tab')||'terms';setPolicy(policies[tab]?tab:'terms')},[]);return <PolicyPage policyId={policy}/> }
