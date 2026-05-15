import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateWpm, calculateAccuracy, KEY_TO_FINGER, charsMatch, getFingerForKey, Finger } from '../lib/typingUtils';

export function useTypingTest(targetText: string, onComplete?: (stats: any) => void) {
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isError, setIsError] = useState(false);

  const stateRef = useRef({
    userInput: "",
    startTime: null as number | null,
    isWaiting: true,
    isFinished: false,
    errors: 0,
    targetText,
  });

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const reset = useCallback(() => {
    stateRef.current = {
      userInput: "",
      startTime: null,
      isWaiting: true,
      isFinished: false,
      errors: 0,
      targetText,
    };
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
    setIsFinished(false);
    setIsWaiting(true);
    setIsError(false);
  }, [targetText]);

  useEffect(() => {
    reset();
  }, [targetText, reset]);

  const beginSession = useCallback(() => {
    if (!stateRef.current.isWaiting) return;
    const now = Date.now();
    stateRef.current.isWaiting = false;
    stateRef.current.startTime = now;
    setIsWaiting(false);
    setStartTime(now);
  }, []);

  const handleKey = useCallback((key: string) => {
    const state = stateRef.current;
    if (state.isFinished) return;

    const currentInput = state.userInput;
    const target = state.targetText;

    if (currentInput.length >= target.length) return;

    const expected = target[currentInput.length];

    if (state.isWaiting) {
      const isStartTrigger = key === " " || key === "Enter";
      const isTypable = key.length === 1;

      if (!isTypable && !isStartTrigger) return;

      if (isStartTrigger && !charsMatch(key, expected)) {
        beginSession();
        return;
      }

      if (isTypable || isStartTrigger) {
        beginSession();
      } else {
        return;
      }
    }

    if (!expected) return;

    const isCorrect = charsMatch(key, expected);

    if (isCorrect) {
      const nextInput = currentInput + expected;
      state.userInput = nextInput;
      setUserInput(nextInput);
      setIsError(false);

      if (nextInput.length === target.length) {
        const now = Date.now();
        state.isFinished = true;
        setEndTime(now);
        setIsFinished(true);

        const effectiveStartTime = state.startTime || now;
        const wpmVal = calculateWpm(nextInput.length, effectiveStartTime, now);
        const accuracyVal = calculateAccuracy(nextInput.length, nextInput.length + state.errors);

        onCompleteRef.current?.({
          wpm: wpmVal,
          accuracy: accuracyVal,
          errorCount: state.errors,
          duration: Math.floor((now - effectiveStartTime) / 1000),
        });
      }
    } else if (key.length === 1) {
      state.errors += 1;
      setErrors(state.errors);
      setIsError(true);
    }
  }, [beginSession]);

  const nextIndex = userInput.length;
  const nextChar = targetText[nextIndex] ?? "";
  const activeFinger: Finger | undefined = getFingerForKey(nextChar);

  return {
    userInput,
    currentChar: nextChar,
    activeFinger,
    isFinished,
    isWaiting,
    isError,
    errors,
    startTime,
    handleKey,
    reset,
    wpm: startTime ? calculateWpm(userInput.length, startTime, endTime || Date.now()) : 0,
    accuracy: calculateAccuracy(userInput.length, userInput.length + errors),
  };
}
