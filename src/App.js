import React, { useState, useEffect } from 'react';
import './App.css';
import { TextField, Button, IconButton, CircularProgress } from '@material-ui/core';
import axios from 'axios';

import { DPI0, W0, H0, newId, px2num, make_Item_0, url2family } from './common';

import { Base } from './components/Base';
import { EditableItems } from './components/EditableItems';
import { EditTheItem } from './components/EditTheItem';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { MyS3Uploader } from './components/MyS3Uploader';

export default function App() {
  const [arrS3File, setArrS3File] = useState([]);

  const [width, setWidth] = useState(W0);
  const [height, setHeight] = useState(H0);
  const [dpiX, setDpiX] = useState(DPI0);
  const [dpiY, setDpiY] = useState(DPI0);

  const [arrItem, setArrItem] = useState([]);
  const [theItem, setTheItem] = useState();

  const [isBusyPdf, setIsBusyPdf] = useState(false);

  useEffect(() => {
    let dpi_x = document.getElementById('testDPI').offsetWidth;
    let dpi_y = document.getElementById('testDPI').offsetHeight;
    setDpiX(dpi_x);
    setDpiY(dpi_y);
  }, []);

  const makeExportHtml = () => {
    let strFontLink = '';
    let strStyleSheet = '';
    arrItem.forEach(item => {
      if (item.style['useCustomFont']) {
        let url = item.style['customFontURL'];
        let family = url2family(url);

        strStyleSheet += `
        <style tyle="text/css">
        @font-face {
          font-family: '${family}';
          src: url('${url}');
        }
        </style>
        `;
      } else {
        let fontFamily = item.style['fontFamily'] || 'Droid Sans';
        fontFamily = fontFamily.replace(' ', '+');
        strFontLink += `<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=${fontFamily}"></link>`;
      }
    });

    let strContent = document.getElementById('exposable_container').innerHTML;
    let exportHtml = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style type="text/css">
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          code {
            font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
              monospace;
          }
        </style>
        ${strStyleSheet}
        ${strFontLink}
      </head>
      <body>
        ${strContent}
      </body>
      </html>`;

    return exportHtml;
  };

  const onClickSave = e => {
    let exportHtml = makeExportHtml();

    exportHtml = exportHtml.replace(/\s{2,}/g, '')   // <-- Replace all consecutive spaces, 2+
      .replace(/%/g, '%25')     // <-- Escape %
      .replace(/&/g, '%26')     // <-- Escape &
      .replace(/#/g, '%23')     // <-- Escape #
      .replace(/"/g, '%22')     // <-- Escape "
      .replace(/'/g, '%27');    // <-- Escape ' (to be 100% safe)

    var downloadLink;
    var dataType = 'text/html';
    let filename = 'index.html';
    downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    if (window.navigator.msSaveOrOpenBlob) {
      var blob = new Blob(['\ufeff', exportHtml], {
        type: dataType
      });
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      downloadLink.href = 'data:' + dataType + ', ' + exportHtml;
      downloadLink.download = filename;
      downloadLink.click();
    }
  };

  const onClickSaveAsPDF = async (event) => {
    setIsBusyPdf(true);
    let exportHtml = makeExportHtml();
    let filename = "Ad.html";

    try {
      let blob1 = new Blob(["\ufeff", exportHtml], { type: "text/html" });
      let file = new File([blob1], filename);

      const formData = new FormData();
      formData.append("file", file);

      let resp = await axios.post(`https://newspaperads.in/api/adbuilder/generatead?width=${width / 96}&height=${height / 96}`, formData, {
        headers: { "content-type": "multipart/form-data" },
      });

      downloadPdf(resp.data);
    } catch (err) { console.log(err); }

  }


  const downloadPdf = (data) => {
    console.log(data);
    // var blob = new Blob([data], { type: 'application/pdf' });
    // // IE doesn't allow using a blob object directly as link href
    // // instead it is necessary to use msSaveOrOpenBlob
    // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    //   window.navigator.msSaveOrOpenBlob(blob);
    //   return;
    // }

    // // For other browsers:
    // // Create a link pointing to the ObjectURL containing the blob.
    // const url = window.URL.createObjectURL(blob);
    // var link = document.createElement('a');
    // link.href = url;
    // link.download = theData.title + '.pdf';
    // link.click();
    // setTimeout(function () {
    //   // For Firefox it is necessary to delay revoking the ObjectURL
    //   window.URL.revokeObjectURL(url);
    // }, 100);

    let filename = "Ad.pdf";
    let downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    downloadLink.href = data;
    downloadLink.download = filename;
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setIsBusyPdf(false);
  }


  const handleSaveTemplate = () => {
    let title = prompt("Please enter the template title:", "New Template");
    if (title == null || title == "") {
      //do nothing
    } else {
      let theData = {
        title: title,
        width: width,
        height: height,
        arrItem: arrItem
      };

      let adContent = JSON.stringify(theData);
      fetch('https://newspaperads.in/api/adbuilder' + "/template", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adContent
        })
      }).then(resp => resp.json()).then(resp => {
        console.log(resp);
      });
    }
  }

  const onClickAdd = e => {
    let newItem;
    if (theItem) {
      newItem = JSON.parse(JSON.stringify(theItem));
      newItem.id = newId();
      newItem.idStr = `div_${newItem.id}`;
      newItem.style.top =
        px2num(newItem.style.top) + px2num(newItem.style.height) + 'px';
    } else {
      newItem = make_Item_0(newId(), width, height / 3, width / 10);
    }

    setArrItem(arrItem => [...arrItem, newItem]);
    setTheItem(newItem);
  };

  const onClickRemove = e => {
    if (theItem && window.confirm('Remove this Div?')) {
      let k = arrItem.findIndex(item => item.id === theItem.id);
      if (k > -1) {
        setTheItem(null);
        setArrItem(arrItem => [
          ...arrItem.slice(0, k),
          ...arrItem.slice(k + 1, arrItem.length)
        ]);
      }
    }
  };

  const handleChangeTheItem = newItem => {
    setTheItem(newItem);

    setArrItem(arrItem => {
      let k = arrItem.findIndex(item => item.id === newItem.id);
      if (k === -1) return arrItem;
      let newArr = [
        ...arrItem.slice(0, k),
        newItem,
        ...arrItem.slice(k + 1, arrItem.length)
      ];
      return newArr;
    });
  };

  return (
    <div>
      <DivTestDPI />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <div>
          <TextField
            label={`Width (${dpiX}dpi)`}
            type="number"
            inputProps={{ min: '0', step: '0.1' }}
            variant="outlined"
            InputLabelProps={{
              shrink: true
            }}
            style={{ width: '120px', margin: '10px 10px' }}
            defaultValue={Math.floor((width * 10) / dpiX) / 10}
            onChange={e => {
              setWidth(e.target.value * dpiX);
            }}
          />
          <TextField
            label={`Height (${dpiY}dpi)`}
            type="number"
            inputProps={{ min: '0', step: '0.1' }}
            variant="outlined"
            InputLabelProps={{
              shrink: true
            }}
            style={{ width: '120px', margin: '10px 10px' }}
            defaultValue={Math.floor((height * 10) / dpiY) / 10}
            onChange={e => {
              setHeight(e.target.value * dpiY);
            }}
          />
          <MyS3Uploader
            propReadArrS3File={arrS3File => setArrS3File(arrS3File)}
          />
        </div>
        <div style={{ flex: 1 }}></div>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveTemplate}
        >
          template
        </Button>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={onClickSave}
          style={{ marginLeft: '50px' }}
        >
          HTML
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={onClickSaveAsPDF}
          style={{ marginLeft: '50px' }}
          disabled={isBusyPdf}
        >
          PDF
         {isBusyPdf && <CircularProgress size={14} />}
        </Button>
      </div>

      <hr />

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            width: '150px',
            border: '1px dotted grey',
            overflowX: 'hidden',
            overflowY: 'auto'
          }}
        >
          <IconButton aria-label="delete" color="primary" onClick={onClickAdd}>
            <AddIcon />
          </IconButton>

          <IconButton
            aria-label="delete"
            color="secondary"
            onClick={onClickRemove}
            disabled={!theItem}
          >
            <DeleteIcon />
          </IconButton>

          <EditableItems
            arrItem={arrItem}
            handleSelect={item => setTheItem(item)}
            handleUnSelect={item => setTheItem(null)}
            theItem={theItem}
          />
        </div>

        <div
          style={{
            flex: 1,
            height: '1000px',
            padding: '20px 20px',
            backgroundColor: 'grey',
            overflowY: 'auto',
            overflowX: 'auto'
          }}
        >
          <Base
            width={width}
            height={height}
            arrItem={arrItem}
            theItem={theItem}
            handleClick={arrItemClicked =>
              setTheItem(arrItemClicked.length > 0 ? arrItemClicked[0] : null)
            }
            handleChangeTheItem={handleChangeTheItem}
          />
        </div>

        <div
          style={{
            flex: 1,
            padding: '10px 10px',
            overflowY: 'auto',
            overflowX: 'scroll',
            height: '600px'
          }}
        >
          {theItem && (
            <EditTheItem
              theItem={theItem}
              handleChange={handleChangeTheItem}
              arrS3File={arrS3File}
            />
          )}
        </div>
      </div>
    </div>
  );
}


const DivTestDPI = () => (
  <div
    id="testDPI"
    style={{
      height: '1in',
      width: '1in',
      position: 'absolute',
      left: '-100%',
      top: '-100%'
    }}
  ></div>
);

