import { useEffect, useId, useState } from 'react';
import axios from 'axios';
import { v4 } from "uuid";

import './app.scss';

function App() {
  const [nums, setNums] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>('');
  const [imgId, setImgId] = useState('');
  const [barcodeExist, setBarcodeExist] = useState(false);

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
      checkBarcodeExists();
      await axios.post(`https://whatsapp-sender-server.onrender.com/api/send`,
        {
          msg,
          nums: formattedNumbers,
          id: imgId
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

  function checkBarcodeExists(i: number = 1) {
    if (i === 5) return;
    fetch(`https://res.cloudinary.com/dmt2zl1ut/image/upload/${imgId}`)
      .then((response) => {
        if (response.status === 200) {
          // Image exists
          setBarcodeExist(true);
          return;
        } else {
          // Image does not exist
          setTimeout(() => checkBarcodeExists(i + 1), 5000);
          return;
        }
      })
      .catch((error) => {
        // Failed to fetch image
        setBarcodeExist(false);
      });
  }

  useEffect(() => {
    if (isLoading) {
      setImgId(v4());
    }
  }, [isLoading]);

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
          {barcodeExist &&
            <img src={`https://res.cloudinary.com/dmt2zl1ut/image/upload/${imgId}`} alt="Cloudinary Image" />
          }
        </form>
      </div>
    </>
  );
}

export default App;
