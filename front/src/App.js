import './App.css';
import { Layout } from 'antd';
import 'antd/dist/antd.css';
import {Form,Input,Alert,Select} from 'antd';
import { ConfigProvider } from 'antd';
import { ClearOutlined } from '@ant-design/icons';

import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';

const { Header, Content } = Layout;

const HIDE_RESULT = "Hide";
const CORRECT_RESULT = "Correct";
const PARTIAL_RESULT  = "Partial";
const IN_CORRECT_RESULT  = "InCorrect";

function normalizeWord(word) {
  let newWord = "";
  for (let index = 0; index < word.length; index++) {
    newWord += Sofiot(word[index]);
  }
  return newWord;
}

function Sofiot(character) {
  switch (character) {
    case "ם":
      return "מ";
    case "ן":
      return "נ";
    case "ף":
      return "פ"
    case "ך":
        return "כ"
    case "ץ":
      return "צ"
    default:
      return character;
  }
}

function App() {
  const [crosswords, setCrosswords] = useState([]);
  const [currentCrossword, setCurrentCrossword] = useState(localStorage.getItem("currentCrossword") || undefined);
  const [currentExpression, setCurrentExpression] = useState(localStorage.getItem("currentExpression") || undefined);
  const [currentDate, setCurrentDate] = useState(localStorage.getItem("currentDate")|| undefined);
  const [dates, setDates] = useState([]);
  const [expressions, setExpressions] = useState({});
  const [answer, setAnswer] = useState(undefined);
  const [showResult, setShowResult] = useState(HIDE_RESULT);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchCrosswords = async () => {
      const result = await axios('/api/crosswords');
      setCrosswords(result.data);
    };

    fetchCrosswords();
  }, []);

  useEffect(() => {
    setDates([]);
    setShowResult(HIDE_RESULT);
    setExpressions({});


    async function fetchDates() {

      const result = await axios(`/api/crosswords/${currentCrossword}`);
      setDates(result.data);
      if(result.data.length > 0) {
        setCurrentDate(localStorage.getItem("currentDate") || result.data[0])
      }
    }
    fetchDates();
  }, [currentCrossword]);

  useEffect(() => {
    if(currentDate) {
      if(currentDate !== localStorage.getItem("currentDate")) {
        setCurrentExpression(undefined);
      }
      localStorage.setItem("currentDate", currentDate);
      }

    if(currentCrossword) {
      if(currentCrossword !== localStorage.getItem("currentCrossword")) {
        setCurrentDate(undefined);
        setCurrentExpression(undefined);
      }
      localStorage.setItem("currentCrossword", currentCrossword);
    }

    if(currentDate) {
      setExpressions({});
      setShowResult(HIDE_RESULT);
      const fetchExpressions = async () => {
        const result = await axios(`/api/crosswords/${currentCrossword}/results?date=${currentDate}`);
        setExpressions(result.data);
      };
      fetchExpressions();
    }
  }, [currentDate, currentCrossword]);

  useEffect(() => {
    localStorage.setItem("currentExpression", currentExpression);
    setShowResult(HIDE_RESULT);
  }, [currentExpression, answer]);

  useEffect(() => {
    if(showResult !== HIDE_RESULT)
    {
      setTimeout(() => {
        const focusElement = document.getElementById("focus");
        focusElement && document.getElementById("focus").scrollIntoView();
      }, 0);
    }
  }, [showResult]);


  const checkExpression = () => {
    const realAnswer = expressions[currentExpression];
    const noramlizedAnswer = normalizeWord(answer);
    const noramlizedRealAnswer = normalizeWord(realAnswer.answer);

      if(noramlizedAnswer === noramlizedRealAnswer) {
        setShowResult(CORRECT_RESULT);
        return;
      }
      else {
        if(noramlizedAnswer.length === noramlizedAnswer.length) {
          let possibleValue = "";

          for (let index = 0; index < answer.length; index++) {
            possibleValue += answer[index] === '*' ? '*' : noramlizedRealAnswer[index]
          }


          if(possibleValue === noramlizedAnswer) {
            setShowResult(PARTIAL_RESULT);
            return;
          }
        }

      }
      setShowResult(IN_CORRECT_RESULT);

  }

  const showMe = () => {
    setShowResult(CORRECT_RESULT);
  }

  const onClear = () => {
    if(inputRef.current) {
      console.log(inputRef.current);
      inputRef.current.focus({
        cursor: 'all',
      });
    }
  }

  return (
    <ConfigProvider direction="rtl">
      <div >
        <Layout>
          <Header>תשבצים!</Header>
          <Content className="App">
            <Form layout="horizontal">
              <Form.Item label="תשבץ">
                <Select  value={currentCrossword} onChange={setCurrentCrossword}>
                {crosswords && crosswords.map(crossword => (<Select.Option key={crossword.id} value={crossword.id}>{crossword.text}</Select.Option>))}
                </Select>
              </Form.Item>
              <Form.Item label="תאריך">
                <Select  value={currentDate} onChange={setCurrentDate}>
                {dates && dates.map(date => (<Select.Option key={date} value={date}>{date}</Select.Option>))}
                </Select>
              </Form.Item>
              <Form.Item label="ביטוי">
              <Select value={currentExpression} onChange={setCurrentExpression}>
                { expressions && Object.entries(expressions).map(([key]) => <Select.Option key={key} value={key}>{key}</Select.Option>)}                  
                </Select>
              </Form.Item>
              <Form.Item label={<>תשובה {expressions[currentExpression]?.answer && <>({expressions[currentExpression]?.answer?.length })</>} <ClearOutlined onClick={onClear}/></>}>
              { (currentExpression && answer!== undefined) ?
              <>
                {answer.length > 0 ? 
                  <Input.Search ref={inputRef} onSearch={checkExpression} enterButton="בדוק" onChange={(val) => setAnswer(val.target.value)}  /> :
                  <Input.Search onSearch={showMe}  enterButton="גלה לי" onChange={(val) => setAnswer(val.target.value)}  />
                }
              </>
              
            :
            <Input.Search onSearch={showMe} enterButton="גלה לי"  onChange={(val) => setAnswer(val.target.value)}  />
          }
              </Form.Item>
            </Form>
            { showResult !== HIDE_RESULT  &&
            <div>
              {showResult === IN_CORRECT_RESULT && <Alert message="התשובה אינה נכונה" type="error" />}
              {showResult === PARTIAL_RESULT && <Alert message="אתם בכיוון" type="success" />}
              {showResult === CORRECT_RESULT && <div>
                { expressions[currentExpression] ?
                  <div>
                    <Alert
                    message={expressions[currentExpression] && answer === expressions[currentExpression].answer &&<span> התשובה נכונה</span>}
                    description={
                      <>
                      <div>תשובה: {expressions[currentExpression].answer }</div>
                      {(expressions[currentExpression].explanation && expressions[currentExpression].explanation.length > 0) ?
                        <>
                        <div>הסבר</div>
                        <ul>
                          {expressions[currentExpression].explanation.map((item) =><li key={item}>{item}</li>)}
                        </ul>
                      </>
                      :
                      <div>אין הסבר</div>}
                      </>
                    }
                    type="success" >
                    </Alert>
                </div>
                :
                <Alert message="אין תשובה זמינה" type="warning" />}

                <button onClick={()=> setShowResult(HIDE_RESULT)}>סגור</button>
                </div>
              }
              <div id='focus'></div>
            </div>}
          </Content>


          </Layout>
      </div>
    </ConfigProvider>
  );
}

export default App;
