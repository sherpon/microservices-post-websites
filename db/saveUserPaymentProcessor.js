const saveUserPaymentProcessor = (firestore, userId, paymentProcessor) => {
  return firestore.collection('users').doc(userId).update({ paymentProcessor });
};

module.exports = saveUserPaymentProcessor;