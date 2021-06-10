import { timer, of, combineLatest } from 'rxjs';
import { Observable } from 'rxjs/dist/types';
import {
  tap,
  concatMap,
  ignoreElements,
  startWith,
  timeout,
  retryWhen,
  delay
} from 'rxjs/operators';

function getMockedStream(timeOffline: number) {
  const intervalTime = 1000;
  const dataInterval$ = timer(0, intervalTime);
  const dataSource$ = of('data test');
  let emissionNumber = 0;
  let sensorData$ = combineLatest(
    dataSource$,
    dataInterval$,
    (source, _) => source
  );
  return sensorData$.pipe(
    concatMap((value: string) => {
      emissionNumber = emissionNumber + 1;
      let displayedData = value + ' ' + emissionNumber;
      if (emissionNumber % 10 == 0) {
        return timer(timeOffline).pipe(
          ignoreElements(),
          startWith(displayedData)
        );
      }
      return timer(intervalTime).pipe(
        ignoreElements(),
        startWith(displayedData)
      );
    })
  );
}

let sensorData$ = getMockedStream(10000);
let emitSensorStateMessage = (error, timeOutAfterOffline) =>
  error.pipe(
    tap(() => console.log('%cSensor is Offline', 'color: red')),
    delay(timeOutAfterOffline)
  );

function handleOffLineState(
  sensorData: Observable<any>,
  timeOutUntilOffline: number,
  timeOutAfterOffline: number
) {
  sensorData
    .pipe(
      timeout(timeOutUntilOffline),
      retryWhen(error => emitSensorStateMessage(error, timeOutAfterOffline))
    )
    .subscribe(console.log);
}
handleOffLineState(sensorData$, 5000, 10000);
