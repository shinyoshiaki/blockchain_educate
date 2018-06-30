import jsonfile from "jsonfile";

export function loadJson(filename) {
  return new Promise(resolve => {
    jsonfile.readFile(filename, (err, obj) => {
      if (err) {
        resolve(null);
      } else {
        console.log("load json");
        resolve(obj);
      }
    });
  });
}

export function saveJson(json, filename) {
  jsonfile.writeFile(filename, json, err => {
    console.log(err);
  });
  console.log("json save", json);
}
