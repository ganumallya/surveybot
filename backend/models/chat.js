var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var chatModel = new Schema({
    ldap: { type: String },
    conversationStatus: {
        type: Number,
        enum: [0, 1, 2]
    },
    conversations: [{ from: String, message: String }],
    surveyName: { type: String },
    surveyId: { type: String },
    currentQuestionId: { type: Number },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
    timeLeft: {type: Number, default : 3600}
});

chatModel.pre('save', function () {
    this.updatedAt = Date.now()
    return new Promise((resolve, reject) => resolve(this))
})

module.exports = mongoose.model('Chat', chatModel);
