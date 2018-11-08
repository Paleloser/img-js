const {Png, Imagen} = require('./img-classes.js');
const fs = require('fs');
const headers = {
  // GIF87a: '47 49 46 38 37 61',
  // GIF89a: '47 49 46 38 39 61',
  // tif: '49 49 2A 0',
  // tiff: '4D 4D 0 2A',
  // bpg: '42 50 47 FB',
  // jpg_JFIF: 'FF D8 FF E0 0 10 4A 46 49 46 0 1',
  // jpg_Exif: 'FF D8 FF E1',
  png: '89 50 4E 47 D A 1A A'
};

if (!process.argv[2]) console.error(`Usage: node img-js.js <filename>`);

const file = fs.readFileSync(process.argv[2]);

let header = '';
let img;

for (let i = 0; i < 12; i++) {
  if (!file[i]) {
    console.error(`No se pudo identificar el formato de la imagen, cabecera obtenida: ${header}`);
    process.exit(0);
    break;
  }
  header += file[i].toString('16').toString('hex');
  for (let [k, v] of Object.entries(headers)) {
    if (header === v.toLowerCase()) {
      img = new Png(k, file.subarray(i+1, file.length));
      console.log(`Image type: ${img.type}`);
      console.log(`Image header: ${img.header}`);
      console.log(`Image body: ${img.body.length} B`);
    }
  }
  if (img) break;
  header += ' ';
}

let parsed = img.parse();
console.log(parsed.ihdr);
console.log(parsed.plte);