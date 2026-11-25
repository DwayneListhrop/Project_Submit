import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../index.html', import.meta.url),'utf8');

test('public distribution has no historical learner seed',()=>{
  assert.doesNotMatch(app,/BASELINE_ROWS|pdf-reported-20261120-exp-eval|screenshot-1|GED-01/);
  assert.match(app,/attempts:\[\],goals:\[\]/);
});
test('core learning modules exist',()=>{
  for(const mark of ['function questBike(','function renderPlay(','function renderCheck(','function ledV8Board(','function renderValidationV11(','function newInitialData(']) assert.ok(app.includes(mark),mark);
});
test('game and independent evidence paths remain distinct',()=>{
  assert.match(app,/q\.mode==='game'\?'game':'guided'/);
  assert.match(app,/verified\?'independent'/);
});
test('no embedded private images or screenshot-derived baseline',()=>{
  assert.doesNotMatch(app,/data:image\/png;base64,/);
  assert.doesNotMatch(app,/Transcribed from supplied Math Games progress screenshot/);
});
