## Data set with custom filters

URL:https://loops-beige.vercel.app/

csv files accessbile here via S3 bucket

https://testbucketdeepika.s3.ap-south-1.amazonaws.com/dataset_small.csv

https://testbucketdeepika.s3.ap-south-1.amazonaws.com/dataset_large.csv

Optimizations applied are
- saved csv files on s3 bucket
- using previous state table data whenever sub filters applied 
- csvs fetched from disk cache whenever possible

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
