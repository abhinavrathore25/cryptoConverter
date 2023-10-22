import { useState, useEffect, useCallback, useRef } from "react";

export default function App() {
  const [currency, setCurrency] = useState("usd"); // Setting Currency
  const [currencyValue, setCurrencyValue] = useState(0); // State to manage current currency value
  const [convertedValue, setConvertedValue] = useState({
    previous: 1,
    current: 1
  }); // State to manage previous and current currency value
  const [inputValue, setInputValue] = useState(1);
  const [differnce, setDifference] = useState(0);
  const initialRender = useRef(true);

  const getValue = useCallback(
    async () => {
      const response = await fetch(
        `https://api.frontendeval.com/fake/crypto/${currency}`
      );
      const data = await response.json();
      setCurrencyValue(data.value);
    },
    [currency]
  );

  //1
  useEffect(() => {
    const interval = setInterval(() => {
      getValue();
    }, 10000);

    return () => {
      clearInterval(interval);
    }

  }, [getValue]);

  //2
  useEffect(() => {
    setConvertedValue((prev) => ({
      previous: prev.current,
      current: currencyValue * inputValue
    }));

  }, [currencyValue, inputValue]);

  //3
  useEffect(() => {
    setDifference(convertedValue.previous - convertedValue.current);
  }, [convertedValue]);

  // 4
  useEffect(() => {

    if (initialRender.current) {
      getValue();
      initialRender.current = false;
      return;
    }

    const debounce = setTimeout(() => {
      getValue();
    }, 500);

    return () => {
      clearTimeout(debounce);
    }

  }, [inputValue, getValue]);

  // Formatting Logic
  const inputRef = useRef();

  const inputFormatSetter = {
    usd: 'en-US',
    eur: 'en-EU',
    gbp: 'en-GB',
    cny: 'zh-CN',
    jpy: 'ja-JP'
  };

  const formatInput = Intl.NumberFormat(inputFormatSetter.currency, {
    style: 'currency',
    currency: currency
  });

  const formattedInput = formatInput.format(inputValue);

  const formatOutput = Intl.NumberFormat('en-US', {
    currency: 'USD'
  });

  return (
    <form className="App">
      <h2>Currency Converter</h2>

      <div style={{ display: 'inline', position: 'relative' }}>
        <input
          type="number"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          style={{ marginRight: '10px', color: 'transparent' }}
          ref={inputRef}
          step='0.1'
        />

        <span
          style={{ position: 'absolute', left: '3px', top: '1px' }}
          onClick={() => inputRef.current.focus()}>
          {formattedInput}
        </span>
      </div>

      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value={"usd"}>USD</option>
        <option value={"eur"}>EUR</option>
        <option value={"gbp"}>GBP</option>
        <option value={"cny"}>CNY</option>
        <option value={"jpy"}>JPY</option>
      </select>


      <p style={{ color: Math.sign(differnce) === 1 ? 'green' : 'red' }}>
        <strong style={{ color: 'black' }}>{
          formatOutput.format(convertedValue.current.toFixed(2))
        } WUC </strong> &nbsp;
        {Math.sign(differnce) === 1 ? '↑ ' : '↓ '}
        {differnce.toFixed(2)}
      </p>
    </form>
  );
}
