export const MY_GOOGLE_API_KEY = 'AIzaSyCECthHE0MkBqQQTcKqK8dUP8MFpV8hVjs';
export const urlServer = 'https://newspaperads.in/api/adbuilder/files/';

export const url2img = url => {
  return `url(${url})`;
};

export const img2url = img => {
  if (!img || img.length < 5) return '';
  console.log('img', typeof img);
  return img.substr(4, img.length - 5);
};

export const url2family = url => {
  let filename = url
    .split('/')
    .pop()
    .split('.')[0];
  filename = 'My' + filename;
  filename = filename.replace('.', '');
  filename = filename.replace('-', '');
  filename = filename.replace('_', '');
  console.log(filename);
  return filename;
};

export const px2num = str => {
  let num = 0;
  if (!str) str = '';
  str = '' + str;
  let len = str.length;
  if (str[len - 2] === 'p' && str[len - 1] === 'x')
    num = Number(str.slice(0, len - 2));
  else num = Number(str);

  return Math.ceil(num * 10000) / 10000;
};

export const DPI0 = 96;

export const W0 = 288;
export const H0 = 288;

export let maxId = 0;
export let newId = () => {
  return ++maxId;
};

export const make_Item_0 = (id, w, h, fontSize) => {
  return {
    id: id,
    text: 'Type text here',
    idStr: `div_${id}`,
    style: {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: w + 'px',
      height: h + 'px',
      paddingTop: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
      paddingRight: '0px',
      zIndex: 1,
      borderStyle: 'none',
      boderWidth: 0,
      borderRadius: 0,
      borderColor: 'black',
      backgroundColor: 'transparent',
      backgroundImage: '',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      fontFamily: 'Droid Sans',
      fontSize: fontSize + 'px',
      fontStyle: 'normal',
      fontWeight: '400',
      color: 'teal',
      textAlign: 'center',
      textAlignVertical: 'none', // this is the trick, not css
      useCustomFont: false, // this is not css, this is trick for google/custom font switch
      customFontURL: '' // this is not css
    }
  };
};
