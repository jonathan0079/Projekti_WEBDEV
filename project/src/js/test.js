const getData = async () => {
  try {
    // tehdään pyyntö HTTP GET
    const response = await fetch('https://api.chucknorris.io/jokes/random');
    console.log(response);
    // muunnetaan json muotoon
    const data = await response.json();
    console.log(data);
    console.log(data.value);
  } catch (error) {
    console.error('Virhe:', error);
  }
};

export {getData};
