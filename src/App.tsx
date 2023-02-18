import { useState } from 'react';
import axios from 'axios';

import './app.scss';

function App() {
  const [nums, setNums] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>('');

  async function onSend(e: any) {
    e.preventDefault();
    if (!msg || !nums) {
      setNotification('Both phone number and message are mandatory.');
      return;
    };
    const numbers: string[] = nums.replace(/\s/g, " ")?.replaceAll('-', '').split(' ');
    const formattedNumbers = numbers.map((n) => {
      if (n.includes('+972')) {
        return n;
      } else {
        return `+972${n.slice(1)}`;
      }
    });
    setIsLoading(true);
    setNotification('Please wait for the barcode to be displayed.');

    try {
      await axios.post(`http://localhost:5005/api/send`,
        {
          msg,
          nums: formattedNumbers,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setNums('');
      setMsg('');
      setNotification(`Messages sent successfully.`);
    } catch (e) {
      setNotification(`Oops, something went wrong.`);
    }

    setTimeout(() => {
      setNotification('');
    }, 5000);
    setIsLoading(false);
  }

  return (
    <>
      <header>
        WhatsApp Sender
      </header>
      <div className="app">
        <form onSubmit={onSend}>
          <div className="numbers">
            <label htmlFor="nums">Enter phone numbers *</label>
            <textarea placeholder='Enter your text...' value={nums} onChange={(e) => setNums(e.target.value)} name="nums" id="nums" rows={4}></textarea>
          </div>
          <div className="divider"></div>
          <div className="message">
            <label htmlFor="msg">Enter WhatsApp message *</label>
            <textarea placeholder='Enter your text...' value={msg} onChange={(e) => setMsg(e.target.value)} name="msg" id="msg" rows={4} />
          </div>
          <button className={isLoading ? 'loading' : ''} type='submit'>{isLoading ? 'Sending' : 'Send Messages'}</button>
          <div className={`notification ${notification ? 'show' : ''}`}>
            <p>
              {notification}
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

export default App;
