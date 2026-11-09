import { NextResponse } from "next/server";

const LLMS_TXT = `# MAK Adverts

> Ethiopia's job board for Dire Dawa, Harar, and the Somali region.

MAK Adverts is a job posting platform serving employers and job seekers in Ethiopia, with a focus on Dire Dawa, Harar, and the Somali region. Job listings are reviewed and payment-verified before publication. All approved jobs are published both on the website and to Telegram channels.

## Key Pages

- Homepage: https://www.makadverts.com/en or https://www.makadverts.com/am (Amharic)
- Browse Jobs: https://www.makadverts.com/en/jobs
- Pricing: https://www.makadverts.com/en/pricing
- Post a Job: https://www.makadverts.com/en/post/new

## Features

- Job listings reviewed by humans before going live
- Payment verification required for all postings
- Dual publication to website and Telegram channels
- Support for English and Amharic (አማርኛ)
- Categories: Business, Creative Arts, Education, Engineering, Finance, Health Care, Hospitality, ICT

## For Employers

Post job vacancies to reach job seekers in Ethiopia. Listings appear on the website and are automatically shared to relevant Telegram channels based on category.

## For Job Seekers

Browse current job vacancies in Ethiopia. Filter by category, employment type, and location. Jobs are updated daily.

## Locales

- English: /en/*
- Amharic: /am/*

## API

This site does not provide a public API. Job listings can be browsed via the public pages.

## Contact

For support, reach out via the official Telegram bot: @MAKAdvertsoffical_bot
Official Telegram channel: https://t.me/+OQm7tPHrOO5iNjNk
`;

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
