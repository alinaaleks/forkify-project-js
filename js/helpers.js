import { async } from "regenerator-runtime";
import { TIMEOUT_SEC } from "./config";
// contain fns that reused in project


// fn returns Promise which will reject after a certain amount of seconds
const timeout = function(s) {
  return new Promise(function(_, reject) {
    setTimeout(() => {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function(url, uploadData = undefined) {
  try {
    const fetchPromise = uploadData 
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);
  
      const res = await Promise.race([fetchPromise, timeout(TIMEOUT_SEC)]); // api in this project itself returns informative error msg if response is failed
      const data = await res.json();
          
      if(!res.ok) throw new Error(`${data.message} (${res.status})`);
      return data; // resolved value of the Promise that this fn returns
  } catch(err) {
    throw err; // (propagate err down from this one to the next) rethrowing err to a fn where getJSON() will be used (to handle err there) => with this Promise that being returned from getJSON() will reject
  }
};