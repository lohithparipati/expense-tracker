/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var storage = require('./storage'),
    textHelper = require('./textHelper');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        //if user said a one shot command that triggered an intent event,
        //it will start a new session, and then we should avoid speaking too many words.
        skillContext.needMoreHelp = false;
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        //Speak welcome message and ask user questions
        //based on whether there are players or not.
        storage.loadGame(session, function (currentGame) {
            var speechOutput = '',
                reprompt;
            if (currentGame.data.players.length === 0) {
                speechOutput += 'ExpenseTracker, Let\'s start managing your money. Who\'s your first friend?';
                reprompt = "Please tell me who is your first friend?";
            } else if (currentGame.isEmptyScore()) {
                speechOutput += 'ExpenseTracker, '
                    + 'you have ' + currentGame.data.players.length + ' friend';
                if (currentGame.data.players.length > 1) {
                    speechOutput += 's';
                }
                speechOutput += ' in the application. You can give money to your friend, add another friend, reset all expenses with friends or exit. Which would you like?';
                reprompt = textHelper.completeHelp;
            } else {
                speechOutput += 'ExpenseTracker, What can I do for you?';
                reprompt = textHelper.nextHelp;
            }
            response.ask(speechOutput, reprompt);
        });
    };
};
exports.register = registerEventHandlers;
