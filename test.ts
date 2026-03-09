const test = async () => {
  try {
    const res = await fetch("https://snapinsta.app/action.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      body: new URLSearchParams({ url: "https://www.instagram.com/p/C-0K8O8sX-R/", action: "post" })
    });
    const data = await res.text();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
};
test();
