export async function requestSound(description) {
  let tryAgain = false;
  do {
    const response = await fetch(`http://10.30.18.170:3001/post`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    console.log(response);

    if (response.ok) {
      const data = await response.json();
      /*const content = data.content[0].text;
        return content;*/
      return data;
    } else if (!tryAgain && response.status == 529) {
      tryAgain = true;
    } else {
      console.error("error");
      tryAgain = false;
    }
  } while (tryAgain);

  return null;
}
