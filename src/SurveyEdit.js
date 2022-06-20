import { Fade, LinearProgress, IconButton, Button, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import React, { useEffect } from 'react';
import { useInterval } from './Utils';
import Axios from 'axios';
import SortableTree from '@nosferatu500/react-sortable-tree';
import CheckBoxIcon from '@mui/icons-material/CheckBoxOutlined';
import RadioButtonIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import TextIcon from '@mui/icons-material/TextFields';
import ToggleIcon from '@mui/icons-material/ToggleOffOutlined';
import NumberIcon from '@mui/icons-material/Looks3Outlined';
import SliderIcon from '@mui/icons-material/TuneOutlined';
import ListIcon from '@mui/icons-material/ReorderOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import EditQuestionDialog from './EditQuestionDialog';
import EditConditionDialog from './EditConditionDialog';
import EditSurveyMetaDataDialog from './EditSurveyMetaDataDialog';
import { QuestionTypes, ReleaseStatusTypes, ManagementViewTypes } from './Constants';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'space-between',
  },
  margin: {
    margin: theme.spacing(1),
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
  },
  action: {
    marginRight: theme.spacing(1),
  },
  loading: {
    marginTop: 10,
  },
  nodeTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeTitleItem: {
    marginRight: 5,
  },
  treeView: {
    height: 'calc(100vh - 170px)',
  },
  surveyTitle: {
    fontWeight: 'normal',
  },
}));

export default function SurveyEdit({ callback, surveyId }) {

  const { classes } = useStyles();

  const [loadingState, setLoadingState] = React.useState({
    data: [],
    delay: 500,
  });

  const [treeData, setTreeData] = React.useState([]);

  const [questionDialogSetup, setQuestionDialogSetup] = React.useState({
    parentId: null,
    surveyElement: null,
  });

  const [conditionDialogSetup, setConditionDialogSetup] = React.useState({
    question: null,
  });

  const [surveyDialogSetup, setSurveyDialogSetup] = React.useState({
    survey: null,
  });

  useInterval(() => {

    Axios.get('/manage/survey/' + surveyId).then(function (response) {
      setLoadingState({
        ...loadingState,
        data: response.data,
        delay: null,
      });
      setTreeData(prepareData(response.data));

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

    if (loadingState.delay != null) {
      return function cleanup() {
        setLoadingState({
          ...loadingState,
          delay: null,
        })
      };
    }
  });

  /**
   * Execute the delete operation of a question.
   * 
   * @param {number} id 
   */
  const onDeleteQuestion = (questionId) => {

    Axios.delete('/manage/question/' + questionId).then(function (response) {
      setLoadingState({
        ...loadingState,
        newQuestionId: null,
        newContainerId: null,
        delay: 500,
      });
    }).catch(function (error) {
      // ignore
    });
  };

  const onDeleteCondition = (containerId) => {

    Axios.delete('/manage/container/' + containerId).then(function (response) {
      setLoadingState({
        ...loadingState,
        newQuestionId: null,
        newContainerId: null,
        delay: 500,
      });
    }).catch(function (error) {
      // ignore
    });
  };

  const onEditSurvey = (survey) => {
    setSurveyDialogSetup({
      survey: survey,
    });
  };

  const onReleaseSurvey = () => {
    Axios.post('/manage/survey/' + surveyId + '/release').then(function (response) {
      callback({ view: ManagementViewTypes.SURVEY_OVERVIEW });
    }).catch(function (error) {
      console.log(error);
    });
  };

  const onEditQuestion = (parentId, question) => {
    setQuestionDialogSetup({
      parentId: parentId,
      surveyElement: question,
    });
  };

  const onEditCondition = (question) => {
    setConditionDialogSetup({
      question: question,
    });
  };

  const onCloseQuestionDialog = (gotEdited, newQuestionId) => {
    setQuestionDialogSetup({
      parentId: null,
      surveyElement: null,
    });

    if (gotEdited)
      setLoadingState({
        ...loadingState,
        newQuestionId: newQuestionId,
        newContainerId: null,
        delay: 500,
      });
  };

  const onCloseConditionDialog = (gotEdited, newContainerId) => {

    setConditionDialogSetup({
      question: null,
    });

    if (gotEdited)
      setLoadingState({
        ...loadingState,
        newQuestionId: null,
        newContainerId: newContainerId,
        delay: 500,
      });
  };

  const onCloseSurveyMetaDialog = (gotEdited) => {

    setSurveyDialogSetup({
      survey: null,
    });

    if (gotEdited)
      setLoadingState({
        ...loadingState,
        newQuestionId: null,
        newContainerId: null,
        delay: 500,
      });
  }

  /**
   * Maps the survey object to the data structure as required by the tree component.
   * 
   * @param {Object} survey 
   */
  const prepareData = (survey) => {

    if (!survey)
      return [];

    const children = [];
    const result = [{
      id: survey.id,
      title: createSurveyNodeTitle(survey),
      children: children,
      expanded: true,
    }];

    if (survey.questions) {
      mapData(children, survey.questions, survey.id);
    }

    return result;
  };

  /**
   * Recursive mapping of survey data structure to data structure as required by the tree component.
   * 
   * @param {Object[]} currentLevel The array to add the new entries to
   * @param {Object[]} questions The array containing the origin objects to add
   * @param {number} parentId The ID of the parent element
   */
  const mapData = (currentLevel, questions, parentId) => {
    if (!questions)
      return;

    questions.forEach(question => {
      const condition = [];

      currentLevel.push({
        id: question.id,
        title: createQuestionNodeTitle(question, parentId),
        children: condition,
        expanded: checkExpandedState(treeData[0], [question.id, question.previousVersionId]) ||
          (loadingState.newContainerId &&
            question.container &&
            question.container.id === loadingState.newContainerId),
      });

      if (question.container) {

        const children = [];
        condition.push({
          id: question.container.id,
          title: createConditionNodeTitle(question),
          children: children,
          expanded: checkExpandedState(treeData[0], [question.container.id]) ||
            (loadingState.newQuestionId &&
              question.container.subQuestions &&
              question.container.subQuestions.some(e => e.id === loadingState.newQuestionId)),
        });

        if (question.container.subQuestions)
          mapData(children, question.container.subQuestions, question.container.id);
      }
    });
  };

  const checkExpandedState = (current, ids) => {

    if (!current)
      return false;

    let result = false;

    for (const child of current.children) {
      if (ids.indexOf(child.id) > -1)
        return child.expanded;

      result = result || checkExpandedState(child, ids);
    }

    return result;
  }

  const createSurveyNodeTitle = (survey) => {
    return (
      <div className={classes.nodeTitle}>
        <Tooltip title="Edit survey metadata">
          <IconButton size="small" color="primary" aria-label="edit" className={classes.nodeTitleItem} onClick={() => onEditSurvey(survey)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add question">
          <IconButton size="small" color="primary" aria-label="add" className={classes.nodeTitleItem} onClick={() => onEditQuestion(survey.id)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
        {survey.releaseStatus === ReleaseStatusTypes.EDIT &&
          <Tooltip title="Changed Item">
            <NewReleasesIcon style={{ color: 'yellowgreen' }} className={classes.nodeTitleItem} />
          </Tooltip>
        }
        <span>{survey.nameId + ': ' + survey.title}</span>
      </div>
    );
  };

  const createConditionNodeTitle = (question) => {
    return (
      <div className={classes.nodeTitle}>
        <Tooltip title="Edit condition">
          <IconButton size="small" color="primary" aria-label="edit" className={classes.nodeTitleItem} onClick={() => onEditCondition(question)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add question">
          <IconButton size="small" color="primary" aria-label="add" className={classes.nodeTitleItem} onClick={() => onEditQuestion(question.container.id)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
        {(question.container.subQuestions == null || question.container.subQuestions.length === 0) &&
          <Tooltip title="Delete condition">
            <IconButton size="small" color="error" aria-label="delete" className={classes.nodeTitleItem} onClick={() => onDeleteCondition(question.container.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        }
        {question.releaseStatus === ReleaseStatusTypes.EDIT &&
          <NewReleasesIcon style={{ color: 'yellowgreen' }} className={classes.nodeTitleItem} />
        }
        <CallSplitIcon color="disabled" style={{ transform: 'rotate(90deg)' }} className={classes.nodeTitleItem} />
        <span>Condition</span>
      </div>
    );
  };

  /**
   * Create the title content used for the title part of the tree nodes.
   * 
   * @param {Object} question 
   */
  const createQuestionNodeTitle = (question, parentId) => {

    let icon = null;
    let canHaveChildren = false;
    let hasCondition = false;

    switch (question.type) {
      case QuestionTypes.CHOICE:
        icon = question.multiple
          ? <Tooltip title="Multiple Choice question"><CheckBoxIcon color="disabled" className={classes.nodeTitleItem} /></Tooltip>
          : <Tooltip title="Single Choice question"><RadioButtonIcon color="disabled" className={classes.nodeTitleItem} /></Tooltip>;
        canHaveChildren = true;
        hasCondition = question.container != null;
        break;
      case QuestionTypes.TEXT:
        icon = <Tooltip title="Text question"><TextIcon color="disabled" className={classes.nodeTitleItem} /></Tooltip>;
        break;
      case QuestionTypes.BOOL:
        icon = <Tooltip title="Yes/No question"><ToggleIcon color="disabled" className={classes.nodeTitleItem} /></Tooltip>;
        canHaveChildren = true;
        hasCondition = question.container != null;
        break;
      case QuestionTypes.NUMBER:
        icon = <Tooltip title="Numeric question"><NumberIcon color="disabled" className={classes.nodeTitleItem} /></Tooltip>;
        break;
      case QuestionTypes.RANGE:
        icon = <Tooltip title="Slider question"><SliderIcon color="disabled" className={classes.nodeTitleItem} /></Tooltip>;
        break;
      case QuestionTypes.CHECKLIST:
        icon = <Tooltip title="DEPRECATED Checklist question"><ListIcon color="disabled" className={classes.nodeTitleItem} /></Tooltip>;
        break;
      default:
    }

    const text = question.question;

    return (
      <div className={classes.nodeTitle}>
        {question.type !== QuestionTypes.CHECKLIST &&
          <Tooltip title="Edit question">
            <IconButton size="small" color="primary" aria-label="edit" className={classes.nodeTitleItem} onClick={() => onEditQuestion(parentId, question)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        }
        {canHaveChildren === true && !hasCondition &&
          <Tooltip title="Add condition">
            <IconButton size="small" color="primary" aria-label="add" className={classes.nodeTitleItem} onClick={() => onEditCondition(question)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        }
        {question.nameId == null && question.container == null &&
          <Tooltip title="Delete question">
            <IconButton size="small" color="error" aria-label="delete" className={classes.nodeTitleItem} onClick={() => onDeleteQuestion(question.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        }
        {question.releaseStatus === ReleaseStatusTypes.EDIT &&
          <Tooltip title="Changed Item">
            <NewReleasesIcon style={{ color: 'yellowgreen' }} className={classes.nodeTitleItem} />
          </Tooltip>
        }
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className={classes.root}>

      {surveyDialogSetup.survey &&
        <EditSurveyMetaDataDialog survey={surveyDialogSetup.survey} callbackHandleClose={onCloseSurveyMetaDialog} />
      }

      <div className={classes.buttons}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          className={classes.action}
          onClick={() => callback({ view: ManagementViewTypes.SURVEY_OVERVIEW })}
        >Back</Button>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<CloudUploadIcon />}
          className={classes.action}
          onClick={onReleaseSurvey}
        >Release Survey</Button>
      </div>

      <Fade in={loadingState.delay != null} className={classes.loading}>
        <LinearProgress />
      </Fade>

      <div className={classes.treeView}>
        <SortableTree
          treeData={treeData}
          onChange={newTreeData => setTreeData(newTreeData)}
          canDrag={false}
        />
      </div>

      {questionDialogSetup && questionDialogSetup.parentId &&
        <EditQuestionDialog
          callbackHandleClose={onCloseQuestionDialog}
          parentId={questionDialogSetup.parentId}
          surveyElement={questionDialogSetup.surveyElement} />
      }
      {conditionDialogSetup && conditionDialogSetup.question &&
        <EditConditionDialog
          callbackHandleClose={onCloseConditionDialog}
          question={conditionDialogSetup.question}
        />
      }
    </div>
  );
}