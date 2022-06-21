import React, { Fragment } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, FormControl, FormControlLabel, InputLabel, Select, MenuItem, TextField, Switch, Grid } from '@mui/material';
import { QuestionTypes } from './Constants';
import { isInteger, isPositiveInteger } from './Utils';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Axios from 'axios';

export default function EditQuestionDialog({ parentId, surveyElement, callbackHandleClose }) {

  const title = surveyElement == null ? 'Add Question' : 'Edit Question';

  const MAX_LENGTH_QUESTION_TEXT = 256;
  const MAX_LENGTH_MIN_TEXT = 32;
  const MAX_LENGTH_MAX_TEXT = 32;
  const MAX_LENGTH_TEXT_ANSWER = 1024;
  const MAX_LENGTH_CHOICE_ANSWER = 32;

  const ERRORS_INIT = {
    question: false,
    minValue: false,
    maxValue: false,
    minText: false,
    maxText: false,
    length: false,
    answers: [],
  };

  const [errors, setErrors] = React.useState({ ...ERRORS_INIT });

  const [questionData, setQuestionData] = React.useState({
    type: surveyElement != null ? surveyElement.type : QuestionTypes.BOOL,
    question: surveyElement != null ? surveyElement.question : "",
    minValue: surveyElement != null && (surveyElement.type === QuestionTypes.NUMBER || surveyElement.type === QuestionTypes.RANGE) ? surveyElement.minValue : "",
    maxValue: surveyElement != null && (surveyElement.type === QuestionTypes.NUMBER || surveyElement.type === QuestionTypes.RANGE) ? surveyElement.maxValue : "",
    minText: surveyElement != null && surveyElement.type === QuestionTypes.RANGE ? surveyElement.minText : "",
    maxText: surveyElement != null && surveyElement.type === QuestionTypes.RANGE ? surveyElement.maxText : "",
    multiline: surveyElement != null && surveyElement.type === QuestionTypes.TEXT ? surveyElement.multiline : false,
    multiple: surveyElement != null && surveyElement.type === QuestionTypes.CHOICE ? surveyElement.multiple : false,
    length: surveyElement != null && surveyElement.type === QuestionTypes.TEXT ? surveyElement.length : "",
    answers: surveyElement != null && surveyElement.type === QuestionTypes.CHOICE ? surveyElement.answers.map(entry => entry.value) : [""],
    optional: surveyElement != null ? surveyElement.optional : false,
    order: surveyElement != null ? surveyElement.order : 0,
  });

  const onChangeType = (event) => {
    setQuestionData({
      ...questionData,
      type: event.target.value,
    });
  };

  const onChangeQuestionText = (event) => {

    if (event.target.value.length > MAX_LENGTH_QUESTION_TEXT)
      return;

    setQuestionData({
      ...questionData,
      question: event.target.value,
    });
  }

  const onChangeDefaultValue = (event) => {
    setQuestionData({
      ...questionData,
      defaultValue: event.target.value,
    });
  }

  const onChangeMinValue = (event) => {
    if (isInteger(event.target.value) || event.target.value === "") {
      setQuestionData({
        ...questionData,
        minValue: event.target.value,
      });
    }
  }

  const onChangeMaxValue = (event) => {
    if (isInteger(event.target.value) || event.target.value === "") {
      setQuestionData({
        ...questionData,
        maxValue: event.target.value,
      });
    }
  }

  const onChangeMinValueText = (event) => {

    if (event.target.value.length > MAX_LENGTH_MIN_TEXT)
      return;

    setQuestionData({
      ...questionData,
      minText: event.target.value,
    });
  }

  const onChangeMaxValueText = (event) => {

    if (event.target.value.length > MAX_LENGTH_MAX_TEXT)
      return;

    setQuestionData({
      ...questionData,
      maxText: event.target.value,
    });
  }

  const onChangeOptional = (event) => {
    setQuestionData({
      ...questionData,
      optional: event.target.checked,
    });
  }

  const onChangeMultiline = (event) => {
    setQuestionData({
      ...questionData,
      multiline: event.target.checked,
    });
  }

  const onChangeMultiple = (event) => {
    setQuestionData({
      ...questionData,
      multiple: event.target.checked,
    });
  }

  const onChangeMaxTextLength = (event) => {
    if (isPositiveInteger(event.target.value) || event.target.value === "") {
      setQuestionData({
        ...questionData,
        length: event.target.value,
      });
    }
  }

  const onChangeAnswer = (event, index) => {

    if (event.target.value.length > MAX_LENGTH_CHOICE_ANSWER)
      return;

    const newAnswers = Object.assign([], questionData.answers, { [index]: event.target.value });
    setQuestionData({
      ...questionData,
      answers: newAnswers,
    });
  }

  const onAddAnswer = () => {
    const newAnswers = questionData.answers.slice();
    newAnswers.push("");
    setQuestionData({
      ...questionData,
      answers: newAnswers,
    });
  }

  const onDeleteAnswer = (index) => {
    const newAnswers = questionData.answers.slice();
    newAnswers.splice(index, 1);
    setQuestionData({
      ...questionData,
      answers: newAnswers,
    });
  }

  const validateAndSave = () => {
    if (validate())
      save();
  }

  const validate = () => {

    const result = { ...ERRORS_INIT };
    let validationFailed = false;

    if (!questionData.question) {
      result.question = true;
      validationFailed = true;
    }

    if (questionData.type === QuestionTypes.RANGE) {

      if (!questionData.minValue) {
        result.minValue = true;
        validationFailed = true;
      }

      if (!questionData.maxValue) {
        result.maxValue = true;
        validationFailed = true;
      }

      if (parseInt(questionData.minValue) >= parseInt(questionData.maxValue)) {
        result.minValue = true;
        result.maxValue = true;
        validationFailed = true;
      }
    }

    if (questionData.type === QuestionTypes.NUMBER) {
      if (parseInt(questionData.minValue) >= parseInt(questionData.maxValue)) {
        result.minValue = true;
        result.maxValue = true;
        validationFailed = true;
      }
    }

    if (questionData.type === QuestionTypes.TEXT) {

      if (!questionData.length) {
        result.length = true;
        validationFailed = true;
      }

      if (parseInt(questionData.length) > MAX_LENGTH_TEXT_ANSWER) {
        result.length = true;
        validationFailed = true;
      }
    }

    if (questionData.type === QuestionTypes.CHOICE) {
      questionData.answers.forEach((element, index) => {
        result.answers[index] = element == null || element.length === 0;
      });
    }

    setErrors(result);

    return !validationFailed;
  }

  const save = () => {

    const path = surveyElement == null ? '/manage/container/' + parentId + '/question' : '/manage/question/' + surveyElement.id;

    const mappedAnswers = questionData.answers.map(element => {
      return { value: element };
    });

    const data = {
      ...questionData,
      answers: mappedAnswers,
    };

    Axios.post(path, data).then(function (response) {
      callbackHandleClose(true, response.data);
    }).catch(function (error) {
      // do nothing
    });
  }

  return (
    <Dialog open={true} maxWidth="md" fullWidth={true} onClose={() => callbackHandleClose()} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} style={{ paddingTop: 10 }}>
          <Grid item xs={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="question-type-label">Question Type</InputLabel>
              <Select
                labelId="question-type-label"
                id="question-type"
                value={questionData.type}
                onChange={onChangeType}
                label="Question Type"
                fullWidth={true}
                disabled={surveyElement != null}
              >
                <MenuItem value={QuestionTypes.BOOL}>Yes/No Question</MenuItem>
                <MenuItem value={QuestionTypes.CHOICE}>Choice Question</MenuItem>
                <MenuItem value={QuestionTypes.NUMBER}>Number Question</MenuItem>
                <MenuItem value={QuestionTypes.RANGE}>Range Question</MenuItem>
                <MenuItem value={QuestionTypes.TEXT}>Text Question</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={questionData.optional}
                  onChange={onChangeOptional}
                  name="optional"
                  color="primary"
                />
              }
              label="Optional"
            />
          </Grid>
          {questionData.type === QuestionTypes.TEXT &&
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={questionData.multiline}
                    onChange={onChangeMultiline}
                    name="multiline"
                    color="primary"
                  />
                }
                label="Multiline"
              />
            </Grid>
          }
          {questionData.type === QuestionTypes.CHOICE &&
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={questionData.multiple}
                    onChange={onChangeMultiple}
                    name="multiple"
                    color="primary"
                  />
                }
                label="Multiple Choice"
              />
            </Grid>
          }
          {questionData.type !== QuestionTypes.TEXT && questionData.type !== QuestionTypes.CHOICE &&
            <Grid item xs={3} />
          }

          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                label="Question Text"
                variant="outlined"
                onChange={onChangeQuestionText}
                value={questionData.question}
                error={errors.question} />
            </FormControl>
          </Grid>

          {(questionData.type === QuestionTypes.NUMBER || questionData.type === QuestionTypes.RANGE) &&
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Minimum Value"
                    variant="outlined"
                    onChange={onChangeMinValue}
                    value={questionData.minValue}
                    error={errors.minValue} />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Maximum Value"
                    variant="outlined"
                    onChange={onChangeMaxValue}
                    value={questionData.maxValue}
                    error={errors.maxValue} />
                </FormControl>
              </Grid>
            </Grid>
          }
          {questionData.type === QuestionTypes.RANGE &&
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Minimum Value Text"
                    variant="outlined"
                    onChange={onChangeMinValueText}
                    value={questionData.minText} />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Maximum Value Text"
                    variant="outlined"
                    onChange={onChangeMaxValueText}
                    value={questionData.maxText} />
                </FormControl>
              </Grid>
            </Grid>
          }
          {questionData.type === QuestionTypes.TEXT &&
            <Grid item container xs={12}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Maximum Text Length"
                    variant="outlined"
                    onChange={onChangeMaxTextLength}
                    value={questionData.length}
                    error={errors.length} />
                </FormControl>
              </Grid>
              <Grid item xs={6} />
            </Grid>
          }
          {questionData.type === QuestionTypes.CHOICE &&
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {questionData.answers.map((row, index) => (
                  <Fragment>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <TextField
                          label={"Answer " + (index + 1)}
                          variant="outlined"
                          onChange={(event) => onChangeAnswer(event, index)}
                          value={questionData.answers[index]}
                          error={errors.answers.length > index && errors.answers[index]} />
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      {index === questionData.answers.length - 1 &&
                        <IconButton size="medium" color="primary" aria-label="add" onClick={onAddAnswer}>
                          <AddIcon />
                        </IconButton>
                      }
                      {questionData.answers.length > 1 &&
                        <IconButton size="medium" color="error" aria-label="delete" onClick={() => onDeleteAnswer(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    </Grid>
                  </Fragment>
                ))}
              </Grid>
            </Grid>
          }
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