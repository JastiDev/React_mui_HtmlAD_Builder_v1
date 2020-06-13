import React, { useState, useEffect } from 'react';
import {
  TextField,
} from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";
import CircularProgress from "@material-ui/core/CircularProgress";

import axios from 'axios';

import { urlServer } from '../common';

const STATUS_INIT = 0;
const STATUS_LOADING = 1;
const STATUS_SUCCESS = 2;
const STATUS_FAILED = 3;

export const MyS3Uploader = ({propReadArrS3File}) => {

  const [status, setStatus] = useState(STATUS_INIT);

  useEffect(() => {
    setStatus(STATUS_LOADING);
    axios
      .get(urlServer)
      .then((resp) => {
        let arrS3File = resp.data;
        arrS3File.splice(0, 1);
        propReadArrS3File(arrS3File);
        setStatus(STATUS_SUCCESS);
      })
      .catch((err) => {
        console.log(err);
        setStatus(STATUS_FAILED);
      });
  }, []);

  const onChangeFile = async (e) => {
    if (e.target.files.length > 0) {
      let file = e.target.files[0];
      
      const formData = new FormData();
      formData.append("file", file);

      setStatus(STATUS_LOADING);
      try {
        let resp = await axios.post(urlServer, formData, {
          headers: { "content-type": "multipart/form-data" },
        });

        resp = await axios.get(urlServer);
        let arrS3File = resp.data;
        arrS3File.splice(0, 1);
        propReadArrS3File(arrS3File);
        setStatus(STATUS_SUCCESS);
      } catch (err) {
        console.log(err);
        setStatus(STATUS_FAILED);
      }
    }
  }

  return (
    <React.Fragment>
      <TextField
        label="upload image or font to AWS_S3"
        type="file"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        style={{ width: "300px", margin: "10px 10px" }}
        onChange={onChangeFile}
      />
      {status === STATUS_FAILED && <WarningIcon color="error" />}
      {status === STATUS_LOADING && <CircularProgress />}
    </React.Fragment>
  );
}
