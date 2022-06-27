import { Dialog, FormControlLabel, DialogActions, DialogContent, DialogTitle, Button, Grid, TextField, Select, MenuItem, Checkbox, LinearProgress, FormControl, InputLabel, Stack } from '@mui/material';
import React, { Fragment, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { isPositiveInteger, useInterval } from './Utils';
import Axios from 'axios';
import { Fader } from './Styles';

export default function SurveyCreate({ survey, callbackHandleClose }) {

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
    nameId: survey == null ? "" : survey.nameId,
    title: survey == null ? "" : survey.title,
    description: survey == null ? "" : survey.description,
    intervalEnabled: survey == null ? false : survey.intervalEnabled,
    intervalValue: survey == null ? "" : survey.intervalValue,
    intervalType: survey == null ? 0 : survey.intervalType,
    intervalStart: survey == null ? null : survey.intervalStart,
    reminderEnabled: survey == null ? false : survey.reminderEnabled,
    reminderValue: survey == null ? "" : survey.reminderValue,
    reminderType: survey == null ? 0 : survey.reminderType,
    dependsOn: -1,
  });

  const title = survey == null ? 'Create Survey' : 'Edit Survey';

  const [errors, setErrors] = React.useState({ ...ERRORS_INIT });

  const [loadingState, setLoadingState] = React.useState({
    data: [],
    delay: 500,
  });

  useInterval(() => {

    Axios.get('/manage/nameid').then(function (response) {
      setLoadingState({
        ...loadingState,
        data: survey ? response.data.filter((value) => value !== survey.nameId) : response.data,
        delay: null,
      });
      if (survey && survey.dependsOn)
        setSurveyData({
          ...surveyData,
          dependsOn: response.data.indexOf(survey.dependsOn),
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
    const result = { ...ERRORS_INIT };
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
    if (survey == null) {

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
        callbackHandleClose(false, true);
      }).catch(function (error) {
        // do nothing
      });
    } else {

      Axios.post('/manage/survey/' + survey.id, {
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
        callbackHandleClose(true);
      }).catch(function (error) {
        // do nothing
      });
    }
  };

  return (
    <Dialog open={true} maxWidth="md" fullWidth={true} onClose={() => callbackHandleClose()} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>

        <Fader in={loadingState.delay != null}>
          <LinearProgress />
        </Fader>

        <Grid container spacing={2} style={{ paddingTop: 10 }}>

          <Grid item xs={12}>
            <TextField
              label="NameID"
              variant="outlined"
              fullWidth
              onChange={onChangeNameId}
              value={surveyData.nameId}
              error={errors.nameId}
              disabled={survey != null} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              onChange={onChangeTitle}
              value={surveyData.title}
              error={errors.title} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline={true}
              rows={5}
              onChange={onChangeDescription}
              value={surveyData.description} />
          </Grid>
          <Grid item xs={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="depends-on-label">Depends on Survey</InputLabel>
              <Select
                labelId="depends-on-label"
                id="depends-on-select"
                value={surveyData.dependsOn}
                onChange={onChangeDependsOn}
                disabled={nameIds == null}
                label="Depends on Survey"
              >
                <MenuItem value="-1" key="-1">
                  <em>None</em>
                </MenuItem>
                {nameIds.map((row, key) => (
                  <MenuItem value={key} key={key}>{row}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={12}>
            <Stack fullWidth direction="row" alignItems="center" spacing={1}>
              <FormControlLabel
                label="Repeat survey"
                control={<Checkbox
                  color="primary"
                  onChange={onChangeIntervalEnabled}
                  checked={surveyData.intervalEnabled}
                />}
                fullWidth
              />
              {surveyData.intervalEnabled &&
                <Fragment>
                  <span>every</span>

                  <TextField
                    style={{ width: 50 }}
                    onChange={onChangeIntervalValue}
                    value={surveyData.intervalValue}
                    error={errors.intervalValue} />

                  <Select value={0} >
                    <MenuItem value={0}>week(s)</MenuItem>
                  </Select>

                  <span>starting at</span>

                  <DateTimePicker
                    label="From"
                    inputFormat="ccc, LLL dd, yyyy HH:mm a ZZZZ"
                    onChange={onChangeIntervalStart}
                    value={surveyData.intervalStart}
                    error={errors.intervalStart}
                    disabled={survey != null}
                    renderInput={(params) => <TextField {...params} style={{ flexGrow: 1 }} />}
                  />
                </Fragment>
              }
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack fullWidth direction="row" alignItems="center" spacing={1}>
              <FormControlLabel
                label="Send reminder"
                control={<Checkbox
                  color="primary"
                  disabled={!surveyData.intervalEnabled}
                  onChange={onChangeReminderEnabled}
                  checked={surveyData.reminderEnabled}
                />}
              />

              {surveyData.reminderEnabled &&
                <Fragment>
                  <span>after</span>
                  <TextField
                    style={{ width: 50 }}
                    onChange={onChangeReminderValue}
                    value={surveyData.reminderValue}
                    error={errors.reminderValue} />
                  <Select value={0}>
                    <MenuItem value={0}>day(s)</MenuItem>
                  </Select>
                </Fragment>
              }
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          disabled={false}
          startIcon={<CancelIcon />}
          onClick={() => callbackHandleClose()}>
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
      </DialogActions>
    </Dialog >
  );
}