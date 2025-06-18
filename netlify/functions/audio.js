import fetch from 'node-fetch';

export async function handler(event) {
  const { src, iid } = event.queryStringParameters;

  let srcUrl = src;
  if (iid) {
    const xmlUrl = `https://www.chabad.org/multimedia/mediaplayer/flash_media_player_content.xml.asp?what=get&aid=&iid=${iid}`;
    const response = await fetch(xmlUrl);
    const text = await response.text();
    const match = text.match(/https?:\/\/[^\s"<>()]+/);
    if (!match) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: "Audio URL not found in XML."
      };
    }
    srcUrl = match[0];
  }

  if (!srcUrl) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: "Missing audio source."
    };
  }

  try {
    const audioRes = await fetch(srcUrl);
    const arrayBuffer = await audioRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="audio.mp3"'
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: "Failed to fetch or stream audio."
    };
  }
}
