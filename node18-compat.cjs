
/**
 * Ho tro mot so API JavaScript con thieu tren Node.js 18.17.1
 * De thu chay Expo SDK 57 tren may tinh truong.
 *
 * Luu y: Day la ban va thu nghiem, khong thay the
 * Node.js >= 20.19.4 theo yeu cau chinh thuc cua Expo.
 */

const diagnostics = require("node:diagnostics_channel");

// ==================================================
// 1. Bo sung diagnostics_channel.tracingChannel
// ==================================================

if (typeof diagnostics.tracingChannel !== "function") {
  diagnostics.tracingChannel = function (name) {
    const makeChannel = (suffix) =>
      diagnostics.channel(`${name}.${suffix}`);

    const channels = {
      start: makeChannel("start"),
      end: makeChannel("end"),
      asyncStart: makeChannel("asyncStart"),
      asyncEnd: makeChannel("asyncEnd"),
      error: makeChannel("error"),
    };

    return {
      ...channels,

      traceSync(fn, context = {}, thisArg, ...args) {
        channels.start.publish(context);

        try {
          return Reflect.apply(fn, thisArg, args);
        } catch (error) {
          channels.error.publish({ ...context, error });
          throw error;
        } finally {
          channels.end.publish(context);
        }
      },

      tracePromise(fn, context = {}, thisArg, ...args) {
        channels.start.publish(context);

        return Promise.resolve()
          .then(() => Reflect.apply(fn, thisArg, args))
          .then(
            (value) => {
              channels.asyncEnd.publish(context);
              return value;
            },
            (error) => {
              channels.error.publish({ ...context, error });
              throw error;
            }
          )
          .finally(() => {
            channels.end.publish(context);
          });
      },

      traceCallback(
        fn,
        position = -1,
        context = {},
        thisArg,
        ...args
      ) {
        const index =
          position < 0 ? args.length + position : position;

        const callback = args[index];

        args[index] = (...callbackArgs) => {
          channels.asyncStart.publish(context);

          try {
            return callback(...callbackArgs);
          } finally {
            channels.asyncEnd.publish(context);
          }
        };

        channels.start.publish(context);

        return Reflect.apply(fn, thisArg, args);
      },

      subscribe(handlers) {
        for (const key of Object.keys(channels)) {
          if (handlers[key]) {
            channels[key].subscribe(handlers[key]);
          }
        }
      },

      unsubscribe(handlers) {
        for (const key of Object.keys(channels)) {
          if (handlers[key]) {
            channels[key].unsubscribe(handlers[key]);
          }
        }
      },
    };
  };
}

// ==================================================
// 2. Bo sung Array.prototype.toReversed
// ==================================================

if (typeof Array.prototype.toReversed !== "function") {
  Object.defineProperty(Array.prototype, "toReversed", {
    value: function () {
      return Array.from(this).reverse();
    },
    writable: true,
    configurable: true,
  });
}

// ==================================================
// 3. Bo sung Array.prototype.toSorted
// ==================================================

if (typeof Array.prototype.toSorted !== "function") {
  Object.defineProperty(Array.prototype, "toSorted", {
    value: function (compareFn) {
      return Array.from(this).sort(compareFn);
    },
    writable: true,
    configurable: true,
  });
}

// ==================================================
// 4. Bo sung Array.prototype.toSpliced
// ==================================================

if (typeof Array.prototype.toSpliced !== "function") {
  Object.defineProperty(Array.prototype, "toSpliced", {
    value: function (start, deleteCount, ...items) {
      const copy = Array.from(this);

      if (arguments.length === 1) {
        copy.splice(start);
      } else {
        copy.splice(start, deleteCount, ...items);
      }

      return copy;
    },
    writable: true,
    configurable: true,
  });
}

// ==================================================
// 5. Bo sung Array.prototype.with
// ==================================================

if (typeof Array.prototype.with !== "function") {
  Object.defineProperty(Array.prototype, "with", {
    value: function (index, value) {
      const copy = Array.from(this);

      const actualIndex =
        index < 0 ? copy.length + index : index;

      if (
        actualIndex < 0 ||
        actualIndex >= copy.length
      ) {
        throw new RangeError("Invalid index");
      }

      copy[actualIndex] = value;

      return copy;
    },
    writable: true,
    configurable: true,
  });
}

console.log("Node 18 compatibility patch loaded.");
