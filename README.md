
# Youtube Video Summarizer

This is a youtube video summarizer in which when user enters a yt video url it summarizes it using AI.


## Tech Stack

**Client:** bolt.new , React+vite+TS
 
**Server:** nhost , hasura actions

**Workflow Automation:** n8n


## Features

- Authentication
- Google Auth
- Typing animation
- Saved History


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`VITE_NHOST_SUBDOMAIN`

`VITE_NHOST_REGION`


## Api used

**Youtube transcripts**: https://youtube-transcriptor.p.rapidapi.com/transcript

**Ai**: models/gemini-2.0-flash-exp

(Limited requests totranscript api..would have to renew the api-key after that)

## License

[MIT](https://choosealicense.com/licenses/mit/)


## Link to the site

https://ytube-summarizer.netlify.app
