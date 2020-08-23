/* eslint-env mocha */

var expect = require('chai').expect;
var sinon = require('sinon');
var inquirer = require('inquirer');
var ReadlineStub = require('../helpers/readline');
var Prompt = require('../../index');

describe('inquirer-autocomplete-prompt', function () {
  var source;
  var prompt;
  var resolve;
  var promise;
  var rl;
  var defaultChoices;
  var promiseForAnswer;

  describe('suggestOnly = true', function () {
    beforeEach(function () {
      defaultChoices = ['foo', new inquirer.Separator(), 'bar', 'bum'];
      promise = new Promise(function (res) {
        resolve = res;
      });
      source = sinon.stub().returns(promise);

      rl = new ReadlineStub();
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          suggestOnly: true,
          source: source,
        },
        rl
      );
    });

    it('applies filter', function () {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter: function (val) {
            return val.slice(0, 2);
          },
          suggestOnly: true,
          source: source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();

      type('banana');
      enter();

      return promiseForAnswer.then(function (answer) {
        expect(answer).to.equal('ba');
      });
    });

    it('applies filter async with done callback', function () {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter: function (val) {
            var done = this.async();
            setTimeout(function () {
              done(null, val.slice(0, 2));
            }, 100);
          },
          suggestOnly: true,
          source: source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();

      type('banana');
      enter();

      return promiseForAnswer.then(function (answer) {
        expect(answer).to.equal('ba');
      });
    });

    it('applies filter async with promise', function () {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter: function (val) {
            return new Promise(function (resolve) {
              resolve(val.slice(0, 2));
            });
          },
          suggestOnly: true,
          source: source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();

      type('banana');
      enter();

      return promiseForAnswer.then(function (answer) {
        expect(answer).to.equal('ba');
      });
    });

    describe('when tab pressed', function () {
      var promiseForAnswer;
      beforeEach(function () {
        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);
        return promise;
      });

      it('autocompletes the value selected in the list', function () {
        tab();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('foo');
        });
      });

      it('accepts any input', function () {
        type('banana');
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('banana');
        });
      });
    });

    describe('validation', function () {
      it('validates sync', function (done) {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate: function () {
              return false;
            },
            source: source,
            suggestOnly: true,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        let hasCompleted = false;

        promise.then(function () {
          enter();

          setTimeout(() => {
            if (hasCompleted) {
              done(
                new Error(
                  'Prompt completed, but should have failed sync validation!.'
                )
              );
            } else {
              done();
            }
          }, 10);

          promiseForAnswer.then(function () {
            hasCompleted = true;
          });
        });
      });

      it('validates async false', function (done) {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate: function () {
              let res;
              const promise = new Promise((resolve) => {
                res = resolve;
              });

              setTimeout(function () {
                res(false);
              }, 10);

              return promise;
            },
            source: source,
            suggestOnly: true,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        let hasCompleted = false;

        promise.then(function () {
          enter();

          setTimeout(() => {
            if (hasCompleted) {
              done(
                new Error(
                  'Prompt completed, but should have failed async validation!.'
                )
              );
            } else {
              done();
            }
          }, 50);

          promiseForAnswer.then(function () {
            hasCompleted = true;
          });
        });
      });

      it('validates async true', function () {
        prompt = new Prompt(
          {
            message: 'test',
            name: 'name',
            validate: function () {
              let res;
              const promise = new Promise((resolve) => {
                res = resolve;
              });

              setTimeout(function () {
                res(true);
              }, 10);

              return promise;
            },
            source: source,
            suggestOnly: true,
          },
          rl
        );

        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);

        return promise.then(function () {
          type('banana');
          enter();

          return promiseForAnswer.then(function (answer) {
            expect(answer).to.equal('banana');
          });
        });
      });
    });
  });

  describe('suggestOnly = false', function () {
    beforeEach(function () {
      defaultChoices = ['foo', new inquirer.Separator(), 'bar', 'bum'];
      promise = new Promise(function (res) {
        resolve = res;
      });
      source = sinon.stub().returns(promise);

      rl = new ReadlineStub();
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          source: source,
        },
        rl
      );
    });

    it('applies filter', function () {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter: function (val) {
            return val.slice(0, 2);
          },
          source: source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();
      resolve(defaultChoices);

      return promise.then(function () {
        moveDown();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('ba');
        });
      });
    });

    it('applies filter async with done calback', function () {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter: function (val) {
            var done = this.async();
            setTimeout(function () {
              done(null, val.slice(0, 2));
            }, 100);
          },
          source: source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();
      resolve(defaultChoices);

      return promise.then(function () {
        moveDown();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('ba');
        });
      });
    });

    it('applies filter async with promise', function () {
      prompt = new Prompt(
        {
          message: 'test',
          name: 'name',
          filter: function (val) {
            return new Promise(function (resolve) {
              resolve(val.slice(0, 2));
            });
          },
          source: source,
        },
        rl
      );

      promiseForAnswer = getPromiseForAnswer();
      resolve(defaultChoices);

      return promise.then(function () {
        moveDown();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('ba');
        });
      });
    });

    it('requires a name', function () {
      expect(function () {
        new Prompt({
          message: 'foo',
          source: source,
        });
      }).to.throw(/name/);
    });

    it('requires a source parameter', function () {
      expect(function () {
        new Prompt({
          name: 'foo',
          message: 'foo',
        });
      }).to.throw(/source/);
    });

    it('immediately calls source with undefined', function () {
      prompt.run();
      sinon.assert.calledOnce(source);
      sinon.assert.calledWithExactly(source, undefined, undefined);
    });

    describe('multiline choices', function () {
      var promiseForAnswer;
      beforeEach(function () {
        promiseForAnswer = getPromiseForAnswer();
        resolve([
          'foo',
          new inquirer.Separator(),
          'multiline\nline2\n\nline4',
          'bum',
        ]);
        return promise;
      });

      it('should select the correct multiline choice', function () {
        moveDown();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('multiline\nline2\n\nline4');
        });
      });

      it('should skip over the multiline choice', function () {
        moveDown();
        moveDown();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('bum');
        });
      });
    });

    describe('when it has some results', function () {
      var promiseForAnswer;
      beforeEach(function () {
        promiseForAnswer = getPromiseForAnswer();
        resolve(defaultChoices);
        return promise;
      });

      it('should move selected cursor on keypress', function () {
        moveDown();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('bar');
        });
      });


      it('should move selected cursor on ctrl n + p keypress', function() {
        moveDownCtrl();
        moveDownCtrl();
        moveUpCtrl();
        enter();

        return promiseForAnswer.then(function(answer) {
          expect(answer).to.equal('bar');
        });
      });

      it('moves up and down', function() {
        moveDown();
        moveDown();
        moveUp();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('bar');
        });
      });

      it('loops choices going down', function () {
        moveDown();
        moveDown();
        moveDown();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('foo');
        });
      });

      it('loops choices going up', function () {
        moveUp();
        enter();

        return promiseForAnswer.then(function (answer) {
          expect(answer).to.equal('bum');
        });
      });
    });

    describe('searching', function () {
      beforeEach(function () {
        prompt.run();
        source.reset();
        source.returns(promise);
      });

      it('searches after each char when user types', function () {
        type('a');
        sinon.assert.calledWithExactly(source, undefined, 'a');
        type('bba');
        sinon.assert.calledWithExactly(source, undefined, 'ab');
        sinon.assert.calledWithExactly(source, undefined, 'abb');
        sinon.assert.calledWithExactly(source, undefined, 'abba');
        sinon.assert.callCount(source, 4);
      });

      it('does not search again if same searchterm (not input added)', function () {
        type('ice');
        sinon.assert.calledThrice(source);
        source.reset();
        typeNonChar();
        sinon.assert.notCalled(source);
      });
    });

    describe('submit', function () {
      describe('without choices', function () {
        beforeEach(function () {
          prompt.run();
          source.reset();
          source.returns(promise);
        });

        it('searches again, since not possible to select something that does not exist', function () {
          sinon.assert.notCalled(source);
          enter();
          sinon.assert.calledOnce(source);
        });
      });

      describe('with suggestOnly', function () {
        var answerValue = {};

        beforeEach(function () {
          promiseForAnswer = getPromiseForAnswer();
          resolve([
            {
              name: 'foo',
              value: answerValue,
              short: 'short',
            },
          ]);
          return promise;
        });

        it('selects the actual value typed');
      });

      describe('with choices', function () {
        var promiseForAnswer;
        var answerValue = {};

        beforeEach(function () {
          promiseForAnswer = getPromiseForAnswer();
          resolve([
            {
              name: 'foo',
              value: answerValue,
              short: 'short',
            },
          ]);
          return promise;
        });

        it('stores the value as the answer and status to answered', function () {
          enter();
          return promiseForAnswer.then(function (answer) {
            expect(answer).to.equal(answerValue);
            expect(prompt.answer).to.equal(answerValue);
            expect(prompt.shortAnswer).to.equal('short');
            expect(prompt.answerName).to.equal('foo');
            expect(prompt.status).to.equal('answered');
          });
        });

        describe('after selecting', function () {
          beforeEach(function () {
            enter();
            source.reset();
            return promiseForAnswer;
          });

          it('stops searching on typing', function () {
            type('test');
            sinon.assert.notCalled(source);
          });

          it('does not change answer on enter', function () {
            enter();
            sinon.assert.notCalled(source);
            return promiseForAnswer.then(function (answer) {
              expect(answer).to.equal(answerValue);
              expect(prompt.answer).to.equal(answerValue);
              expect(prompt.status).to.equal('answered');
            });
          });
        });
      });
    });
  });

  function getPromiseForAnswer() {
    return prompt.run();
  }

  function typeNonChar() {
    rl.input.emit('keypress', '', {
      name: 'shift',
    });
  }

  function type(word) {
    word.split('').forEach(function (char) {
      rl.line = rl.line + char;
      rl.input.emit('keypress', char);
    });
  }

  function moveDown() {
    rl.input.emit('keypress', '', {
      name: 'down',
    });
  }

  function moveDownCtrl() {
    rl.input.emit('keypress', '', {
      name: 'n',
      ctrl: true
    });
  }

  function moveUpCtrl() {
    rl.input.emit('keypress', '', {
      name: 'p',
      ctrl: true
    });
  }

  function moveUp() {
    rl.input.emit('keypress', '', {
      name: 'up',
    });
  }

  function enter() {
    rl.emit('line');
  }

  function tab() {
    rl.input.emit('keypress', '', {
      name: 'tab',
    });
  }
});
