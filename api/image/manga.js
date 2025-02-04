const cache = new Map();

export async function fetchData(extension, page) {
  const cacheKey = `${extension}_${page}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const apiUrl = `https://dokusha-extenstions.onrender.com/${extension}/fetch/data/${page}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    cache.set(cacheKey, data);
    
    // Clear old cache entries if cache gets too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function fetchInfo(extention, hid) {
  const apiUrl = `https://dokusha-extenstions.onrender.com/${extention}/fetch/info/${hid}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return []; // Return an empty array in case of error
  }
}

export async function fetchImages(hid) {
  const apiUrl = `https://dokusha-extenstions.onrender.com/${extention}/fetch/images/${hid}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return []; // Return an empty array in case of error
  }
}