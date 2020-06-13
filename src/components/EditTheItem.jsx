import React, { useState } from 'react'
import {
  TextField,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent
} from "@material-ui/core";

import { Autocomplete } from "@material-ui/lab";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import PaletteIcon from "@material-ui/icons/Palette";
import { px2num, MY_GOOGLE_API_KEY, url2family, url2img, img2url } from "../common";

import { SketchPicker } from "react-color";
import FontPicker from "font-picker-react";


const Font_Extensions = ["eot", "ttf", "woff", "woff2", "svg"];
const Img_Extensions = ["apng", "png", "bmp", "gif", "ico", "cur", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "svg", "tif", "tiff", "webp"];


export const EditTheItem = ({ theItem, handleChange, arrS3File }) => {

  const [isModal, setIsModal] = useState(false);
  const [editingColor, setEditingColor] = useState('color');

  const changeIdStr = (idStr) => {
    let tmp = JSON.parse(JSON.stringify(theItem));
    tmp.idStr = idStr;
    handleChange(tmp);
  }

  const changeText = (text) => {
    let tmp = JSON.parse(JSON.stringify(theItem));
    tmp.text = text;
    handleChange(tmp);
  }

  const changeStyle = (strkey, value) => {
    let tmp = JSON.parse(JSON.stringify(theItem));

    if (strkey === 'textAlignVertical') {  //this is the trick, not css
      let hDiv = px2num(tmp.style['height']);
      let hFont = px2num(tmp.style['fontSize']);
      if (value === 'none') tmp.style['paddingTop'] = 0 + 'px';
      else if (value === 'top') tmp.style['paddingTop'] = 0 + 'px';
      else if (value === 'center') tmp.style['paddingTop'] = (hDiv-hFont)/2 + 'px';
      else if (value === 'bottom') tmp.style['paddingTop'] = hDiv-hFont + 'px';
    }
    else if (strkey === 'paddingTop' || strkey === 'height') {
      tmp.style['textAlignVertical'] = 'none';
    }
    else if (strkey === "useCustomFont") {
      tmp.style["fontFamily"] = "";
      tmp.style["customFontURL"] = "";
    }
    else if (strkey === "customFontURL") { //this is the trick, not css
      let url = value;
      let family = url2family(url);
      if (!family || family.length === 0) return;
      let junction_font = new FontFace(family, `url(${url})`);
      junction_font
        .load()
        .then((loaded_face) => {
          document.fonts.add(loaded_face);
        })
        .catch((err) => console.log(err));

      tmp.style["fontFamily"] = family;      
    }

    tmp.style[strkey] = value;
    handleChange(tmp);
  }

  // const onChangeImage = (e) => {
  //   if (e.target.files.length > 0) {
  //     let file = e.target.files[0];
  //     const fr = new FileReader();
  //     fr.onloadend = (e) => {
  //       let buf = e.target.result;
  //       changeStyle("backgroundImage", url2img(buf));
  //     };
  //     fr.readAsDataURL(file);
  //   } else {
  //     changeStyle('backgroundImage', "" );
  //   }
  // };

  // const MyInputText = (strkey, width="120px") => (
  //   <TextField
  //     label={strkey}
  //     variant="outlined"
  //     InputLabelProps={{
  //       shrink: true,
  //     }}
  //     style={{ width: width, margin: "10px 10px" }}
  //     value={theItem.style[strkey] || ""}
  //     onChange={(e) => changeStyle(strkey, e.target.value)}
  //   />
  // );

  const MyInputNumber = (strkey) => (
    <TextField
      label={strkey}
      type="number"
      variant="outlined"
      InputLabelProps={{
        shrink: true,
      }}
      style={{ width: "120px", margin: "10px 10px" }}
      value={px2num(theItem.style[strkey])}
      onChange={(e) => changeStyle(strkey, e.target.value + "px" )}
    />
  );

  const MyInputSelect = (strkey, width="150px") => (
    <Autocomplete
      options={Arr_Option[strkey]}
      getOptionLabel={(option) => option}
      disableClearable
      autoHighlight
      renderInput={(params) => (
        <TextField
          {...params}
          label={strkey}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
      )}
      value={theItem.style[strkey]}
      onChange={(e, value) => changeStyle(strkey, value)}
      style={{ width: width, margin: "10px 10px",  display:'inline-block'}}
    />
  );

  const MyInputSelectS3File = (strkey, width = "150px") => {
    let arrOption = [];

    arrS3File.forEach((s3file, i) => {
      let ext = s3file.split(".").pop();
      if (strkey === "customFontURL" && Font_Extensions.includes(ext)) arrOption.push(s3file);
      else if (strkey === "backgroundImage" && Img_Extensions.includes(ext)) arrOption.push(s3file);
    });

    return (
      <Autocomplete
        options={arrOption}
        getOptionLabel={(option) => option.split("/").pop()}
        disableClearable
        autoHighlight
        renderInput={(params) => (
          <TextField
            {...params}
            label={strkey}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        )}
        onChange={(event, value) => {
          let option = value;
          if (strkey === 'backgroundImage') option = url2img(option);
          changeStyle(strkey, option);
        }}
        value={
          strkey === "backgroundImage"
            ? img2url(theItem.style[strkey])
            : theItem.style[strkey]
        }
        style={{ width: width, margin: "10px 10px", display: "inline-block" }}
      />
    );
  }


  const MyInputColor = (strkey) => (
    <div style={{ display: "inline-block", margin: "10px 10px" }}>
      <TextField
        label={strkey}
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        style={{ width: "150px" }}
        value={theItem.style[strkey] || ""}
        onChange={(e) => changeStyle(strkey, e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => { setEditingColor(strkey); setIsModal(true); }}>
                <PaletteIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );

  return (
    <div>
      <TextField
        label="idStr"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        style={{ width: "200px" }}
        value={theItem.idStr || ""}
        onChange={(e) => changeIdStr(e.target.value)}
      />
      <hr />
      <TextField
        label="text"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        style={{ width: "100%" }}
        value={theItem.text || ""}
        onChange={(e) => changeText(e.target.value)}
      />
      <hr />
      {MyInputNumber("fontSize")}
      {MyInputColor("color")}
      {MyInputSelect("textAlign")}
      {MyInputSelect("textAlignVertical")}
      {MyInputSelect("fontStyle")}
      {MyInputSelect("fontWeight")}
      <hr />
      <div style={{ display: "flex", flexDirection: "row", minHeight: "70px" }}>
        <div style={{ width: "200px" }}>
          <span style={{ padding: "10px" }}>Use Custom Font</span>
          <IconButton
            onClick={(e) => {
              changeStyle("useCustomFont", !theItem.style["useCustomFont"]);
            }}
          >
            {theItem.style["useCustomFont"] ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )}
          </IconButton>
        </div>
        {!theItem.style["useCustomFont"] && (
          <div style={{zIndex:100}}>
            <span style={{ padding: "10px" }}>Google Font</span>
            <FontPicker
              apiKey={MY_GOOGLE_API_KEY}
              limit={500}
              activeFontFamily={theItem.style["fontFamily"]}
              onChange={(nextFont) => {
                changeStyle("fontFamily", nextFont.family);
              }}
            />
          </div>
        )}

        <div
          style={{
            display: theItem.style["useCustomFont"] ? "block" : "none",
          }}
        >
          {MyInputSelectS3File("customFontURL", "250px")}
        </div>
      </div>
      <hr />
      {MyInputNumber("width")}
      {MyInputNumber("height")}
      {MyInputNumber("left")}
      {MyInputNumber("top")}
      <hr />
      {MyInputNumber("paddingLeft")}
      {MyInputNumber("paddingRight")}
      {MyInputNumber("paddingTop")}
      {MyInputNumber("paddingBottom")}
      <hr />
      {MyInputSelect("borderStyle")}
      {MyInputNumber("borderWidth")}
      {MyInputNumber("borderRadius")}
      {MyInputColor("borderColor")}
      <hr />
      {MyInputColor("backgroundColor")}
      {/* <TextField
        label="backgroundImage"
        type="file"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        style={{ width: "250px", margin: "10px 10px" }}
        onChange={onChangeImage}
      /> */}
      {MyInputSelectS3File("backgroundImage", "250px")}
      {MyInputSelect("backgroundRepeat")}
      {MyInputSelect("backgroundSize")}
      {MyInputSelect("backgroundPosition")}
      <Dialog
        open={isModal}
        onClose={() => {
          setIsModal(false);
        }}
      >
        <DialogTitle>
          Select {editingColor}
          <IconButton
            onClick={(e) => setIsModal(false)}
            style={{ float: "right" }}
          >
            <PaletteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <SketchPicker
            color={theItem.style[editingColor]}
            onChangeComplete={(color) => {
              console.log(color);
              changeStyle(editingColor, color.hex);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}




const Arr_Option = {
  borderStyle: [
    "none",
    "solid",
    "dotted",
    "dashed",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
  ],
  backgroundRepeat: [
    "no-repeat",
    "repeat-x",
    "repeat-y",
    "repeat",
    "space",
    "round",
  ],
  backgroundSize: ["cover", "contain", "length", "percentage", "auto"],
  backgroundPosition: [
    "left top",
    "left center",
    "left bottom",
    "right top",
    "right center",
    "right bottom",
    "center top",
    "center center",
    "center bottom",
  ],
  fontStyle: ["normal", "italic", "oblique"],
  fontWeight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  textAlign: ["left", "right", "center", "justify"],
  textAlignVertical: ["none", "top", "center", "bottom"], //this is not css, here is the trick
};
