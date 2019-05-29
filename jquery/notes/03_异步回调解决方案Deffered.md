## Deferred API

- jQuery.Deferred()：一个构造函数，返回一个链式实用对象方法来注册多个回调，回调队列，调用回调队列，并转达任何同步或异步函数的成功或失败状态。
- deferred.done()：当Deferred(延迟)对象解决时，调用添加处理程序。
- deferred.fail()：当Deferred(延迟)对象拒绝时，调用添加处理程序。
- deferred.progress()：当生成进度通知时，调用添加的处理程序。
- jQuery.when()：提供一种方法来执行一个或多个对象的回调函数，Deferred(延迟)对象通常表示异步事件。
- .promise()：返回一个Promise对象，用来观察当某种类型的所有行动绑定到集合，排队与否还是已经完成。

## Deferred对象设计
有3个Callback队列
- resolved 成功
  - promise.done触发添加处理函数到队列；
  - deferred.resolve触发执行队列中的处理函数；
- rejected 失败
  - promise.fail触发添加处理函数到队列；
  - deferred.reject触发执行队列中的处理函数；
- pending 进行中
  - promise.progress触发添加处理函数到队列；
  - deferred.notify触发执行队列中的处理函数；

这3个队列怎么创建出来的？
通过$.Callbacks()创建。
Deferred用于状态绑定，promise用于往队列添加处理函数。

## demo
```javascript
var wait = function() {
  var der = $.Deferred()
  var test = function() {
    console.log('老司机开车了')
    der.resolve()
  }
  setTimeout(test, 2000)
  return der
}

$.when(wait())
  .done(function() {
    console.log('执行成功')
  })
  .fail(function() {
    console.log('执行失败')
  })
```

## 源码
```javascript
jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [
      // action, add listener, callbacks,
      // ... .then handlers, argument index, [final state]
      [ "notify", "progress", jQuery.Callbacks( "memory" ),
        jQuery.Callbacks( "memory" ), 2 ],
      [ "resolve", "done", jQuery.Callbacks( "once memory" ),
        jQuery.Callbacks( "once memory" ), 0, "resolved" ],
      [ "reject", "fail", jQuery.Callbacks( "once memory" ),
        jQuery.Callbacks( "once memory" ), 1, "rejected" ]
    ],
		state = "pending",
    promise = {
      state: function() {
        return state;
      },
      always: function() {
        deferred.done( arguments ).fail( arguments );
        return this;
      },
      "catch": function( fn ) {
        return promise.then( null, fn );
      },

      // Keep pipe for back-compat
      pipe: function( /* fnDone, fnFail, fnProgress */ ) {
        var fns = arguments;

        return jQuery.Deferred( function( newDefer ) {
          jQuery.each( tuples, function( i, tuple ) {

            // Map tuples (progress, done, fail) to arguments (done, fail, progress)
            var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

            // deferred.progress(function() { bind to newDefer or newDefer.notify })
            // deferred.done(function() { bind to newDefer or newDefer.resolve })
            // deferred.fail(function() { bind to newDefer or newDefer.reject })
            deferred[ tuple[ 1 ] ]( function() {
              var returned = fn && fn.apply( this, arguments );
              if ( returned && isFunction( returned.promise ) ) {
                returned.promise()
                  .progress( newDefer.notify )
                  .done( newDefer.resolve )
                  .fail( newDefer.reject );
              } else {
                newDefer[ tuple[ 0 ] + "With" ](
                  this,
                  fn ? [ returned ] : arguments
                );
              }
            } );
          } );
          fns = null;
        } ).promise();
      },
      then: function( onFulfilled, onRejected, onProgress ) {
        var maxDepth = 0;
        function resolve( depth, deferred, handler, special ) {
          return function() {
            var that = this,
              args = arguments,
              mightThrow = function() {
                var returned, then;

                // Support: Promises/A+ section 2.3.3.3.3
                // https://promisesaplus.com/#point-59
                // Ignore double-resolution attempts
                if ( depth < maxDepth ) {
                  return;
                }

                returned = handler.apply( that, args );

                // Support: Promises/A+ section 2.3.1
                // https://promisesaplus.com/#point-48
                if ( returned === deferred.promise() ) {
                  throw new TypeError( "Thenable self-resolution" );
                }

                // Support: Promises/A+ sections 2.3.3.1, 3.5
                // https://promisesaplus.com/#point-54
                // https://promisesaplus.com/#point-75
                // Retrieve `then` only once
                then = returned &&

                  // Support: Promises/A+ section 2.3.4
                  // https://promisesaplus.com/#point-64
                  // Only check objects and functions for thenability
                  ( typeof returned === "object" ||
                    typeof returned === "function" ) &&
                  returned.then;

                // Handle a returned thenable
                if ( isFunction( then ) ) {

                  // Special processors (notify) just wait for resolution
                  if ( special ) {
                    then.call(
                      returned,
                      resolve( maxDepth, deferred, Identity, special ),
                      resolve( maxDepth, deferred, Thrower, special )
                    );

                  // Normal processors (resolve) also hook into progress
                  } else {

                    // ...and disregard older resolution values
                    maxDepth++;

                    then.call(
                      returned,
                      resolve( maxDepth, deferred, Identity, special ),
                      resolve( maxDepth, deferred, Thrower, special ),
                      resolve( maxDepth, deferred, Identity,
                        deferred.notifyWith )
                    );
                  }

                // Handle all other returned values
                } else {

                  // Only substitute handlers pass on context
                  // and multiple values (non-spec behavior)
                  if ( handler !== Identity ) {
                    that = undefined;
                    args = [ returned ];
                  }

                  // Process the value(s)
                  // Default process is resolve
                  ( special || deferred.resolveWith )( that, args );
                }
              },

              // Only normal processors (resolve) catch and reject exceptions
              process = special ?
                mightThrow :
                function() {
                  try {
                    mightThrow();
                  } catch ( e ) {

                    if ( jQuery.Deferred.exceptionHook ) {
                      jQuery.Deferred.exceptionHook( e,
                        process.stackTrace );
                    }

                    // Support: Promises/A+ section 2.3.3.3.4.1
                    // https://promisesaplus.com/#point-61
                    // Ignore post-resolution exceptions
                    if ( depth + 1 >= maxDepth ) {

                      // Only substitute handlers pass on context
                      // and multiple values (non-spec behavior)
                      if ( handler !== Thrower ) {
                        that = undefined;
                        args = [ e ];
                      }

                      deferred.rejectWith( that, args );
                    }
                  }
                };

            // Support: Promises/A+ section 2.3.3.3.1
            // https://promisesaplus.com/#point-57
            // Re-resolve promises immediately to dodge false rejection from
            // subsequent errors
            if ( depth ) {
              process();
            } else {

              // Call an optional hook to record the stack, in case of exception
              // since it's otherwise lost when execution goes async
              if ( jQuery.Deferred.getStackHook ) {
                process.stackTrace = jQuery.Deferred.getStackHook();
              }
              window.setTimeout( process );
            }
          };
        }

        return jQuery.Deferred( function( newDefer ) {

          // progress_handlers.add( ... )
          tuples[ 0 ][ 3 ].add(
            resolve(
              0,
              newDefer,
              isFunction( onProgress ) ?
                onProgress :
                Identity,
              newDefer.notifyWith
            )
          );

          // fulfilled_handlers.add( ... )
          tuples[ 1 ][ 3 ].add(
            resolve(
              0,
              newDefer,
              isFunction( onFulfilled ) ?
                onFulfilled :
                Identity
            )
          );

          // rejected_handlers.add( ... )
          tuples[ 2 ][ 3 ].add(
            resolve(
              0,
              newDefer,
              isFunction( onRejected ) ?
                onRejected :
                Thrower
            )
          );
        } ).promise();
      },

      // Get a promise for this deferred
      // If obj is provided, the promise aspect is added to the object
      promise: function( obj ) {
        return obj != null ? jQuery.extend( obj, promise ) : promise;
      }
    },
    deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );
```
