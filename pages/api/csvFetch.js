// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(type) {
  let url = 'https://testbucketdeepika.s3.ap-south-1.amazonaws.com/dataset_small.csv'
  if(type=='large')
  url = 'https://testbucketdeepika.s3.ap-south-1.amazonaws.com/dataset_large.csv'
  return fetch(url).then(res=>res.text())
}
