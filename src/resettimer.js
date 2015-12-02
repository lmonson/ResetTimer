var doc = require('dynamodb-doc');
var dynamo = new doc.DynamoDB();


function createTimer(event,context) {
  var now = Math.round(Date.now()/1000);
  var duration = Number(event.timerDuration);
  if ( duration < 5 )
    duration = 5;

  var request = {
    TableName: "resettimer",
    "Item": {
      timername: event.timerName,
      timerstart: Number(now),
      timerduration: duration,
      triggertime: now + Number(event.timerDuration)
    }
  };

  dynamo.putItem(request, function(error,timer_result) {
    if (error) {
      context.fail(error);
      return;
    }

    context.succeed({
      timerName: event.timerName,
      secondsRemaining: duration
    });
  });
}

function evalTimer(event,context) {
  var request = {
    TableName: "resettimer",
    Key: {
      "timername": event.timerName
    }
  };

  dynamo.getItem(request,function(error,timer_result){
    if ( error ) {
      context.fail(error);
      return;
    }

    updateTimer(event,context,timer_result.Item);
  })
}

function updateTimer(event,context,lastReadValue) {
  var now = Math.round(Date.now()/1000);
  var newTrigger = now + Number(lastReadValue.timerduration);

  var updateRequest = {
    TableName: "resettimer",
    Key: {
      "timername": event.timerName
    },
    UpdateExpression: "SET timerstart = :now, triggertime = :newtrigger",
    ConditionExpression: ":now >= triggertime",
    ExpressionAttributeValues: {
      ":now": Number(now),
      ":newtrigger": Number(newTrigger)
    },
    "ReturnValues": "ALL_NEW"
  };

  dynamo.updateItem(updateRequest,function(error,timer_result){
    if (error && error.name==="ConditionalCheckFailedException") {
      var remaining = lastReadValue.timerduration - now + lastReadValue.timerstart;
      if ( remaining >= lastReadValue.timerduration )
        remaining = 1;
      context.succeed({
        timerName:event.timerName,
        secondsRemaining: remaining
      });
      return;
    }

    if (error) {
      context.fail(error);
      return;
    }

    context.succeed({
      timerName:event.timerName,
      secondsRemaining: 0
    });
  })


}


exports.handler = function(event, context) {
  console.log(event);
  if ( event.timerDuration )
    createTimer(event,context);
  else
    evalTimer(event,context);

};