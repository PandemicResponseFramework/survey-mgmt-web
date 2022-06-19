import { Button, Grid, TextField, Select, MenuItem, Checkbox, Fade, LinearProgress, FormControl, InputLabel } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import React, { useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import DateFnsUtils from '@date-io/date-fns';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import {isPositiveInteger, useInterval} from './Utils';
import Axios from 'axios';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'space-between',
  },
  container: {
    '& > div': {
      display: 'flex',
      alignItems: 'center',
    }
  },
  textField: {
    flexGrow: 1,
  },
  inputGrid: {
    '& > *': {
      marginRight: 10,
    },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  formControl: {
    minWidth: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function SurveyCreate({callback}) {

  const { classes } = useStyles();

  const MAX_LENGTH_NAMEID = 32;
  const MAX_LENGTH_TITLE = 64;
  const MAX_LENGTH_DESCR = 256;

  const REGEX_NAMEID = /^[A-Z][A-Z0-9_]*$/;

  const ERRORS_INIT = {
    nameId: false,
    title: false,
    description: false,
    intervalValue: false,
    intervalStart: false,
    reminderValue: false,
  };

  const [surveyData, setSurveyData] = React.useState({
    nameId: "",
    title: "",
    description: "",
    intervalEnabled: false,
    intervalValue: "",
    intervalType: 0,
    intervalStart: null,
    reminderEnabled: false,
    reminderValue: "",
    reminderType: 0,
    dependsOn: -1,
  });

  const [errors, setErrors] = React.useState({...ERRORS_INIT});

  const [loadingState, setLoadingState] = React.useState({
    data: [],
    delay: 500,
  });

  useInterval(() => {

    Axios.get('/manage/nameid').then(function (response) {
      setLoadingState({
        ...loadingState,
        data: response.data,
        delay: null,
      });
    }).catch(function (error) {
      if (loadingState) {
        setLoadingState({
          ...loadingState,
          delay: null,
        });
      }
    });
  }, loadingState == null ? null : loadingState.delay);

  useEffect(() => {

    return function cleanup() {
      setLoadingState({
        ...loadingState,
        delay: null,
      })
    };
  }, []);

  const nameIds = loadingState.data;

  const onChangeNameId = (event) => {
    if (event.target.value.length <= MAX_LENGTH_NAMEID && REGEX_NAMEID.test(event.target.value)) {
      setSurveyData({
        ...surveyData,
        nameId: event.target.value,
      });
    }
  };

  const onChangeTitle = (event) => {
    if (event.target.value.length <= MAX_LENGTH_TITLE) {
      setSurveyData({
        ...surveyData,
        title: event.target.value,
      });
    }
  };

  const onChangeDescription = (event) => {
    if (event.target.value.length <= MAX_LENGTH_DESCR) {
      setSurveyData({
        ...surveyData,
        description: event.target.value,
      });
    }
  };

  const onChangeDependsOn = (event) => {
    setSurveyData({
      ...surveyData,
      dependsOn: event.target.value,
    });
  };

  const onChangeIntervalEnabled = (event) => {
    setSurveyData({
      ...surveyData,
      intervalEnabled: event.target.checked,
      reminderEnabled: event.target.checked === false ? false : surveyData.reminderEnabled,
    });
  };

  const onChangeIntervalValue = (event) => {
    if (isPositiveInteger(event.target.value) || event.target.value === "") {
      setSurveyData({
        ...surveyData,
        intervalValue: event.target.value,
      });
    }
  };

  const onChangeIntervalStart = (value) => {
    setSurveyData({
      ...surveyData,
      intervalStart: value,
    });
  };

  const onChangeReminderEnabled = (event) => {
    setSurveyData({
      ...surveyData,
      reminderEnabled: event.target.checked,
    });
  };

  const onChangeReminderValue = (event) => {
    if (isPositiveInteger(event.target.value) || event.target.value === "") {
      setSurveyData({
        ...surveyData,
        reminderValue: event.target.value,
      });
    }
  };

  const validateAndSave = (event) => {

    // validate
    const result = {...ERRORS_INIT};
    let validationFailed = false;

    if (!surveyData.nameId) {
      result.nameId = true;
      validationFailed = true;
    }
    if (!surveyData.title) {
      result.title = true;
      validationFailed = true;
    }
    if (surveyData.intervalEnabled && !surveyData.intervalValue) {
      result.intervalValue = true;
      validationFailed = true;
    }
    if (surveyData.intervalEnabled && !surveyData.intervalStart) {
      result.intervalStart = true;
      validationFailed = true;
    }
    if (surveyData.reminderEnabled) {

      if (!surveyData.reminderValue) {
        result.reminderValue = true;
        validationFailed = true;

      } else if (surveyData.intervalValue) {
        // validate valid reminder days
        if (!(surveyData.reminderValue < surveyData.intervalValue * 7)) {
          result.reminderValue = true;
          validationFailed = true;
        }
      }
    }

    if (validationFailed) {
      setErrors(result);
      return;
    }

    // save
    Axios.post('/manage/survey', {
      nameId: surveyData.nameId,
      title: surveyData.title,
      description: surveyData.description,
      dependsOn: surveyData.dependsOn === -1 ? null : nameIds[surveyData.dependsOn],
      intervalEnabled: surveyData.intervalEnabled,
      intervalType: 'WEEKLY',
      intervalValue: parseInt(surveyData.intervalValue),
      intervalStart: new Date(surveyData.intervalStart).toISOString(),
      reminderEnabled: surveyData.reminderEnabled,
      reminderType: 'AFTER_DAYS',
      reminderValue: parseInt(surveyData.reminderValue),
    }).then(function (response) {
      callback({viewId: 'SURVEY_OVERVIEW'});
    }).catch(function (error) {
      // do nothing
    });
  };

  return (
    <div className={classes.root}>
      <Fade in={loadingState.delay != null} className={classes.loading}>
        <LinearProgress />
      </Fade>

      <Grid container spacing={1} className={classes.container}>
        <Grid item xs={12}>
          <h2>Create New Survey</h2>
        </Grid>
        <Grid item xs={12}>
          <TextField 
            label="NameID" 
            variant="outlined" 
            className={classes.textField} 
            onChange={onChangeNameId} 
            value={surveyData.nameId}
            error={errors.nameId}/>
        </Grid>
        <Grid item xs={12}>
          <TextField 
            label="Title" 
            variant="outlined" 
            className={classes.textField} 
            onChange={onChangeTitle} 
            value={surveyData.title}
            error={errors.title}/>
        </Grid>
        <Grid item xs={12}>
          <TextField 
            label="Description" 
            variant="outlined" 
            className={classes.textField} 
            multiline={true} 
            rows={5} 
            onChange={onChangeDescription} 
            value={surveyData.description}/>
        </Grid>
        <Grid item xs={12}>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="depends-on-label">Depends on Survey</InputLabel>
            <Select
              labelId="depends-on-label"
              id="depends-on-select"
              value={surveyData.dependsOn}
              onChange={onChangeDependsOn}
              disabled={nameIds==null}
              label="Depends on Survey">
              <MenuItem value="-1" key="-1">
                <em>None</em>
              </MenuItem>
              {nameIds.map((row, key) => (
                <MenuItem value={key} key={key}>{row}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} className={classes.inputGrid}>
          <Checkbox 
            color="primary" 
            onChange={onChangeIntervalEnabled} 
            checked={surveyData.intervalEnabled}/>
          
          <span>Repeat survey</span>
          
          {surveyData.intervalEnabled &&
            <div className={classes.inputGrid}>
              <span>every</span>
              
              <TextField 
                style={{width: 50}} 
                onChange={onChangeIntervalValue} 
                value={surveyData.intervalValue} 
                error={errors.intervalValue}/>
              
              <Select value={0} >
                <MenuItem value={0}>week(s)</MenuItem>
              </Select>
              
              <span>starting at</span>
              
              <DateTimePicker
                margin="normal"
                id="interval-start-dialog"
                format="dd-MM-yyyy HH:mm"
                onChange={onChangeIntervalStart}
                value={surveyData.intervalStart}
                error={errors.intervalStart}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }} />
            </div>
          }
        </Grid>
        <Grid item xs={12} className={classes.inputGrid}>
          <Checkbox 
            color="primary" 
            disabled={!surveyData.intervalEnabled} 
            onChange={onChangeReminderEnabled} 
            checked={surveyData.reminderEnabled}/>
          
          <span>Send reminder</span>
          
          {surveyData.reminderEnabled &&
            <div className={classes.inputGrid}>
              <span>after</span>

              <TextField 
                style={{width: 50}} 
                onChange={onChangeReminderValue}
                value={surveyData.reminderValue}
                error={errors.reminderValue}/>
              
              <Select value={0}>
                <MenuItem value={0}>day(s)</MenuItem>
              </Select>
            </div>
          }
        </Grid>
        <Grid item xs={12} className={classes.inputGrid}>
          <Button
            variant="contained"
            color="secondary"
            disabled={false}
            startIcon={<CancelIcon />}
            onClick={(event) => callback({viewId: 'SURVEY_OVERVIEW'})}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={false}
            startIcon={<SaveIcon />}
            onClick={validateAndSave}>
            Save
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}