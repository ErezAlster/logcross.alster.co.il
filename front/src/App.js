import './App.css';
import { Layout } from 'antd';
import 'antd/dist/antd.css';
import {Form,Input,Alert,Select} from 'antd';
import { ConfigProvider } from 'antd';

import axios from 'axios';
import React, { useState, useEffect } from 'react';

const { Header, Content } = Layout;

const HIDE_RESULT = "Hide";
const CORRECT_RESULT = "Correct";
const PARTIAL_RESULT  = "Partial";
const IN_CORRECT_RESULT  = "InCorrect";


function App() {
  const [crosswords, setCrosswords] = useState([]);
  const [currentCrossword, setCurrentCrossword] = useState(undefined);
  const [currentExpression, setCurrentExpression] = useState(undefined);
  const [currentDate, setCurrentDate] = useState(undefined);
  const [dates, setDates] = useState([]);
  const [expressions, setExpressions] = useState({});
  const [answer, setAnswer] = useState(undefined);
  const [showResult, setShowResult] = useState(HIDE_RESULT);

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
    }
    fetchDates();
  }, [currentCrossword]);

  useEffect(() => {
    if(currentDate) {
      setExpressions({});
      setShowResult(HIDE_RESULT);
      setCurrentExpression(undefined);
      const fetchExpressions = async () => {
        const result = await axios(`/api/crosswords/${currentCrossword}/results?date=${currentDate}`);
        setExpressions(result.data);
      };
      fetchExpressions();
    }
  }, [currentDate, currentCrossword]);

  useEffect(() => {
    setShowResult(HIDE_RESULT);
  }, [currentExpression, answer]);


  const checkExpression = () => {
    const realAnswer = expressions[currentExpression];
      if(answer === realAnswer.answer) {
        setShowResult(CORRECT_RESULT);
        return;
      }
      else {
        if(answer.length === realAnswer.answer.length) {
          let possibleValue = "";

          for (let index = 0; index < answer.length; index++) {
            possibleValue += answer[index] === '*' ? '*' : realAnswer.answer[index]
          }


          if(possibleValue === answer) {
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
              <Select value={currentExpression} onChange={(val)=> setCurrentExpression(val)}>
                { expressions && Object.entries(expressions).map(([key]) => <Select.Option key={key} value={key}>{key}</Select.Option>)}                  
                </Select>
              </Form.Item>
              <Form.Item label="תשובה">
              { (currentExpression && answer!== undefined) ?
              <>
                {answer.length > 0 ? 
                  <Input.Search onSearch={checkExpression} enterButton="בדוק"  onChange={(val) => setAnswer(val.target.value)}  /> :
                  <Input.Search onSearch={showMe}  enterButton="גלה לי"  onChange={(val) => setAnswer(val.target.value)}  />
                }
              </>
              
            :
            <Input.Search onSearch={showMe}  enterButton="גלה לי"  onChange={(val) => setAnswer(val.target.value)}  />
          }
              </Form.Item>
            </Form>
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

          </Content>


          </Layout>
      </div>
    </ConfigProvider>
  );
}

export default App;
