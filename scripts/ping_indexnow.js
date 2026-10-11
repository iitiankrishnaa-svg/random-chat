/**
 * Submits all StrangerSpace URLs to the IndexNow API (Microsoft Bing, Yahoo, Yandex, etc.)
 */
async function submitIndexNow() {
  const host = 'randomchat-alpha.vercel.app';
  const key = 'c7f938b8e0144d2d881944510061e8bf';
  const keyLocation = `https://${host}/${key}.txt`;

  const urlList = [
    `https://${host}/`,
    `https://${host}/chat`,
    `https://${host}/safety`,
    `https://${host}/community-guidelines`,
    `https://${host}/privacy`,
    `https://${host}/terms`,
    `https://${host}/support`
  ];

  const payload = {
    host,
    key,
    keyLocation,
    urlList
  };

  try {
    console.log('Sending IndexNow submission for host:', host);
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    console.log('IndexNow Response Status:', response.status);
    if (response.status === 200 || response.status === 202) {
      console.log('Successfully submitted all URLs to IndexNow (Bing/Yahoo/Yandex)!');
    } else {
      const text = await response.text();
      console.log('IndexNow response body:', text);
    }
  } catch (err) {
    console.error('Error pinging IndexNow:', err.message);
  }
}

submitIndexNow();
