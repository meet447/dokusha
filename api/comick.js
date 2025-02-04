export async function fetchAndFormatData(apiUrl) {
  return fetch(apiUrl, {
    headers: {
      'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      'Referer': 'https://comick.io/',
      'sec-ch-ua-mobile': '?0',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'sec-ch-ua-platform': '"Windows"'
    }
  })
  .then(response => response.json())
  .then(data => {
    const formattedData = data.map(item => ({
      id: item.md_comics.id,
      hid: item.md_comics.hid,
      title: item.md_comics.title,
      image: `https://meo2.comick.pictures/${item.md_comics.md_covers[0].b2key}`,
      slug:item.md_comics.slug,
    }));
    return formattedData;
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    return []; // Returning empty array in case of an error
  });
}


export async function infoManga(hid) {
    let page = 1;
    let result = [];
    let apiUrl = `https://api.comick.io/comic/${hid}/chapters?lang=en&page=${page}`;

    const fetchData = async () => {
        while (true) {
            console.log(apiUrl);

            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                        'Referer': 'https://comick.io/',
                        'sec-ch-ua-mobile': '?0',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                        'sec-ch-ua-platform': '"Windows"'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                if (!Array.isArray(data.chapters)) {
                    throw new Error("Data is not an array");
                }

                if (data.chapters.length === 0) {
                    return result; // Return accumulated result if no more data available
                }

                const formattedData = data.chapters.map(item => ({
                    id: item.id,
                    hid: item.hid,
                    title: item.title,
                    chap: item.chap,
                }));

                result.push(...formattedData);

                page++;
                apiUrl = `https://api.comick.io/comic/${hid}/chapters?lang=en&page=${page}`;
            } catch (error) {
                console.error('Error fetching data:', error);
                return result; // Returning accumulated result in case of an error
            }
        }
    };

    return fetchData();
}

export async function fetchImages(hid) {
    const url = `https://api.comick.io/chapter/${hid}/?tachiyomi=true`;

    const headers = {
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'x-nextjs-data': '1',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': 'https://comick.io/comic/arrogant-slave/3VLs19tU-chapter-18-en',
        'baggage': 'sentry-environment=production,sentry-release=3c673cdcab1a4f27420d07d160289250b5edbdc1,sentry-public_key=275d2003b9c64216a438e1d0ca8acf33,sentry-trace_id=6040a110716b42dab5bab473e75a28de,sentry-sample_rate=0.05,sentry-transaction=%2Fcomic%2F%5Bslug%5D%2F%5Bchapter%5D,sentry-sampled=false',
        'sentry-trace': '6040a110716b42dab5bab473e75a28de-85d85857aedca1b0-0',
        'sec-ch-ua-platform': '"Windows"'
    };

    try {
        const response = await fetch(url, {
            headers: headers
        });
        const data = await response.json();

        const res = { 'images': [], 'prev': [], 'next': [] };

        for (const item of data.chapter.images) {
            res.images.push(item.url);
        }

        let n_chap = 'None', n_hid = 'None', p_chap = 'None', p_hid = 'None';

        if (data.next) {
            n_chap = data.next.chap;
            n_hid = data.next.hid;
        }

        if (data.prev) {
            p_chap = data.prev.chap;
            p_hid = data.prev.hid;
        }

        const item1 = { "chap": n_chap, 'hid': n_hid };
        const item2 = { "chap": p_chap, 'hid': p_hid };

        res.next.push(item1);
        res.prev.push(item2);
        
        console.log(res)
        return res;
    } catch (error) {
        console.error(`Error fetching images: ${error}`);
        return { 'images': [], 'prev': [], 'next': [] };
    }
}

// Add this function to fetch chapters for a manga
export const fetchChapters = async (hid) => {
  try {
    const apiUrl = `https://api.comick.io/comic/${hid}/chapters?lang=en&page=1`;
    const response = await fetch(apiUrl, {
      headers: {
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Referer': 'https://comick.io/',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'sec-ch-ua-platform': '"Windows"'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    if (!data.chapters || !Array.isArray(data.chapters)) {
      return [];
    }

    return data.chapters.map(chapter => ({
      id: chapter.id,
      hid: chapter.hid,
      title: chapter.title,
      chap: chapter.chap,
    }));
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

// Add this new search function
export async function searchManga(query) {
  try {
    const apiUrl = `https://api.comick.io/v1.0/search?q=${encodeURIComponent(query)}&t=true`;
    const response = await fetch(apiUrl, {
      headers: {
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'Referer': 'https://comick.io/',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'sec-ch-ua-platform': '"Windows"'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Filter out items without necessary data and map to consistent format
    return data
      .filter(item => item && item.md_covers && item.md_covers[0] && item.md_covers[0].b2key)
      .map(item => ({
        id: item.id || '',
        hid: item.hid || '',
        title: item.title || 'Unknown Title',
        image: item.md_covers[0].b2key ? 
          `https://meo2.comick.pictures/${item.md_covers[0].b2key}` : 
          'https://placeholder.com/150x200',
        slug: item.slug || '',
        altTitles: (item.md_titles || [])
          .filter(t => t && t.title)
          .map(t => t.title)
      }));
  } catch (error) {
    console.error('Error searching manga:', error);
    return [];
  }
}
