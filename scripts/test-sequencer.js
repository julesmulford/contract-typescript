const Sequencer = require('@jest/test-sequencer').default;

class PactSequencer extends Sequencer {
  sort(tests) {
    return [...tests].sort((a, b) => {
      const isConsumerA = a.path.includes('consumer');
      const isConsumerB = b.path.includes('consumer');
      if (isConsumerA && !isConsumerB) return -1;
      if (!isConsumerA && isConsumerB) return 1;
      return 0;
    });
  }
}

module.exports = PactSequencer;
