(() => {
  // src/Header.js
  var TAGS = {
    // Standard "Seven Tag Roster"
    Event: "Event",
    // the name of the tournament or match event
    Site: "Site",
    // the location of the event
    Date: "Date",
    // the starting date of the game (format: YYYY.MM.TT)
    Round: "Round",
    // the playing round ordinal of the game
    White: "White",
    // the player of the white pieces (last name, pre name)
    Black: "Black",
    // the player of the black pieces (last name, pre name)
    Result: "Result",
    // the result of the game (1-0, 1/2-1/2, 0-1, *)
    // Optional (http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm#c9)
    //      Player related information
    WhiteTitle: "WhiteTitle",
    BlackTitle: "BlackTitle",
    // These use string values such as "FM", "IM", and "GM"; these tags are used only for the standard abbreviations for FIDE titles. A value of "-" is used for an untitled player.
    WhiteElo: "WhiteElo",
    BlackElo: "BlackElo",
    // These tags use integer values; these are used for FIDE Elo ratings. A value of "-" is used for an unrated player.
    WhiteUSCF: "WhiteUSCF",
    BlackUSCF: "BlackUSCF",
    // These tags use integer values; these are used for USCF (United States Chess Federation) ratings. Similar tag names can be constructed for other rating agencies.
    WhiteNA: "WhiteNA",
    BlackNA: "BlackNA:",
    // These tags use string values; these are the e-mail or network addresses of the players. A value of "-" is used for a player without an electronic address.
    WhiteType: "WhiteType",
    BlackType: "BlackType",
    // These tags use string values; these describe the player types. The value "human" should be used for a person while the value "program" should be used for algorithmic (computer) players.
    //      Event related information
    EventDate: "EventDate",
    // This uses a date value, similar to the Date tag field, that gives the starting date of the Event.
    EventSponsor: "EventSponsor",
    // This uses a string value giving the name of the sponsor of the event.
    Section: "Section",
    // This uses a string; this is used for the playing section of a tournament (e.g., "Open" or "Reserve").
    Stage: "Stage",
    // This uses a string; this is used for the stage of a multistage event (e.g., "Preliminary" or "Semifinal").
    Board: "Board",
    // This uses an integer; this identifies the board number in a team event and also in a simultaneous exhibition.
    //      Opening information (locale specific)
    Opening: "Opening",
    // This uses a string; this is used for the traditional opening name. This will vary by locale. This tag pair is associated with the use of the EPD opcode "v0" described in a later section of this document.
    ECO: "ECO",
    // This uses a string of either the form "XDD" or the form "XDD/DD" where the "X" is a letter from "A" to "E" and the "D" positions are digits.
    //      Time and date related information
    Time: "Time",
    // Time the game started, in "HH:MM:SS" format, in local clock time.
    UTCTime: "UTCTime",
    // This tag is similar to the Time tag except that the time is given according to the Universal Coordinated Time standard.
    UTCDate: "UTCDate",
    // This tag is similar to the Date tag except that the date is given according to the Universal Coordinated Time standard.
    //      Time control
    TimeControl: "TimeControl",
    // 40/7200:3600 (moves per seconds: sudden death seconds)
    //      Alternative starting positions
    SetUp: "SetUp",
    // "0": position is start position, "1": tag FEN defines the position
    FEN: "FEN",
    //  Alternative start position, tag SetUp has to be set to "1"
    //      Game conclusion
    Termination: "Termination",
    // Gives more details about the termination of the game. It may be "abandoned", "adjudication" (result determined by third-party adjudication), "death", "emergency", "normal", "rules infraction", "time forfeit", or "unterminated".
    //      Miscellaneous
    Annotator: "Annotator",
    // The person providing notes to the game.
    Mode: "Mode",
    // "OTB" (over-the-board) "ICS" (Internet Chess Server)
    PlyCount: "PlyCount"
    // String value denoting total number of half-moves played.
  };
  var Header = class {
    constructor(headerString = "") {
      this.clear();
      const rows = headerString.match(/\[([^\]]+)]/g);
      if (rows && rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          let tag = rows[i].match(/\[(\w+)\s+"([^"]+)"/);
          if (tag) {
            this.tags[tag[1]] = tag[2];
          }
        }
      }
    }
    clear() {
      this.tags = {};
    }
    render() {
      let rendered = "";
      for (const tag in this.tags) {
        rendered += `[${tag} "${this.tags[tag]}"]
`;
      }
      return rendered;
    }
  };

  // src/parser/pgnParser.js
  function peg$subclass(child, parent) {
    function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }
  function peg$SyntaxError(message, expected, found, location) {
    this.message = message;
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }
  peg$subclass(peg$SyntaxError, Error);
  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
      literal: function(expectation) {
        return '"' + literalEscape(expectation.text) + '"';
      },
      "class": function(expectation) {
        var escapedParts = "", i;
        for (i = 0; i < expectation.parts.length; i++) {
          escapedParts += expectation.parts[i] instanceof Array ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1]) : classEscape(expectation.parts[i]);
        }
        return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
      },
      any: function(expectation) {
        return "any character";
      },
      end: function(expectation) {
        return "end of input";
      },
      other: function(expectation) {
        return expectation.description;
      }
    };
    function hex(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }
    function literalEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex(ch);
      });
    }
    function classEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex(ch);
      });
    }
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      var descriptions = new Array(expected2.length), i, j;
      for (i = 0; i < expected2.length; i++) {
        descriptions[i] = describeExpectation(expected2[i]);
      }
      descriptions.sort();
      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };
  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};
    var peg$FAILED = {}, peg$startRuleFunctions = { pgn: peg$parsepgn }, peg$startRuleFunction = peg$parsepgn, peg$c0 = function(pw, all) {
      var arr = all ? all : [];
      arr.unshift(pw);
      return arr;
    }, peg$c1 = function(pb, all) {
      var arr = all ? all : [];
      arr.unshift(pb);
      return arr;
    }, peg$c2 = function() {
      return [[]];
    }, peg$c3 = function(pw) {
      return pw;
    }, peg$c4 = function(pb) {
      return pb;
    }, peg$c5 = function(cm, mn, cb, hm, nag, ca, vari, all) {
      var arr = all ? all : [];
      var move = {};
      move.turn = "w";
      move.moveNumber = mn;
      move.notation = hm;
      move.commentBefore = cb;
      move.commentAfter = ca;
      move.commentMove = cm;
      move.variations = vari ? vari : [];
      move.nag = nag ? nag : null;
      arr.unshift(move);
      return arr;
    }, peg$c6 = function(cm, me, cb, hm, nag, ca, vari, all) {
      var arr = all ? all : [];
      var move = {};
      move.turn = "b";
      move.moveNumber = me;
      move.notation = hm;
      move.commentBefore = cb;
      move.commentAfter = ca;
      move.variations = vari ? vari : [];
      arr.unshift(move);
      move.nag = nag ? nag : null;
      return arr;
    }, peg$c7 = "1:0", peg$c8 = peg$literalExpectation("1:0", false), peg$c9 = function() {
      return ["1:0"];
    }, peg$c10 = "0:1", peg$c11 = peg$literalExpectation("0:1", false), peg$c12 = function() {
      return ["0:1"];
    }, peg$c13 = "1-0", peg$c14 = peg$literalExpectation("1-0", false), peg$c15 = function() {
      return ["1-0"];
    }, peg$c16 = "0-1", peg$c17 = peg$literalExpectation("0-1", false), peg$c18 = function() {
      return ["0-1"];
    }, peg$c19 = "1/2-1/2", peg$c20 = peg$literalExpectation("1/2-1/2", false), peg$c21 = function() {
      return ["1/2-1/2"];
    }, peg$c22 = "*", peg$c23 = peg$literalExpectation("*", false), peg$c24 = function() {
      return ["*"];
    }, peg$c25 = /^[^}]/, peg$c26 = peg$classExpectation(["}"], true, false), peg$c27 = function(cm) {
      return cm.join("").trim();
    }, peg$c28 = "{", peg$c29 = peg$literalExpectation("{", false), peg$c30 = "}", peg$c31 = peg$literalExpectation("}", false), peg$c32 = function(vari, all, me) {
      var arr = all ? all : [];
      arr.unshift(vari);
      return arr;
    }, peg$c33 = function(vari, all) {
      var arr = all ? all : [];
      arr.unshift(vari);
      return arr;
    }, peg$c34 = "(", peg$c35 = peg$literalExpectation("(", false), peg$c36 = ")", peg$c37 = peg$literalExpectation(")", false), peg$c38 = ".", peg$c39 = peg$literalExpectation(".", false), peg$c40 = function(num) {
      return num;
    }, peg$c41 = peg$otherExpectation("integer"), peg$c42 = /^[0-9]/, peg$c43 = peg$classExpectation([["0", "9"]], false, false), peg$c44 = function(digits) {
      return makeInteger(digits);
    }, peg$c45 = " ", peg$c46 = peg$literalExpectation(" ", false), peg$c47 = function() {
      return "";
    }, peg$c48 = function(fig, disc, str, col, row, pr, ch) {
      var hm = {};
      hm.fig = fig ? fig : null;
      hm.disc = disc ? disc : null;
      hm.strike = str ? str : null;
      hm.col = col;
      hm.row = row;
      hm.check = ch ? ch : null;
      hm.promotion = pr;
      hm.notation = (fig ? fig : "") + (disc ? disc : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
      return hm;
    }, peg$c49 = function(fig, cols, rows, str, col, row, pr, ch) {
      var hm = {};
      hm.fig = fig ? fig : null;
      hm.strike = str == "x" ? str : null;
      hm.col = col;
      hm.row = row;
      hm.check = ch ? ch : null;
      hm.notation = (fig && fig !== "P" ? fig : "") + cols + rows + (str == "x" ? str : "-") + col + row + (pr ? pr : "") + (ch ? ch : "");
      hm.promotion = pr;
      return hm;
    }, peg$c50 = function(fig, str, col, row, pr, ch) {
      var hm = {};
      hm.fig = fig ? fig : null;
      hm.strike = str ? str : null;
      hm.col = col;
      hm.row = row;
      hm.check = ch ? ch : null;
      hm.notation = (fig ? fig : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
      hm.promotion = pr;
      return hm;
    }, peg$c51 = "O-O-O", peg$c52 = peg$literalExpectation("O-O-O", false), peg$c53 = function(ch) {
      var hm = {};
      hm.notation = "O-O-O" + (ch ? ch : "");
      hm.check = ch ? ch : null;
      return hm;
    }, peg$c54 = "O-O", peg$c55 = peg$literalExpectation("O-O", false), peg$c56 = function(ch) {
      var hm = {};
      hm.notation = "O-O" + (ch ? ch : "");
      hm.check = ch ? ch : null;
      return hm;
    }, peg$c57 = "+-", peg$c58 = peg$literalExpectation("+-", false), peg$c59 = "+", peg$c60 = peg$literalExpectation("+", false), peg$c61 = function(ch) {
      return ch[1];
    }, peg$c62 = "$$$", peg$c63 = peg$literalExpectation("$$$", false), peg$c64 = "#", peg$c65 = peg$literalExpectation("#", false), peg$c66 = "=", peg$c67 = peg$literalExpectation("=", false), peg$c68 = function(f) {
      return "=" + f;
    }, peg$c69 = function(nag, nags) {
      var arr = nags ? nags : [];
      arr.unshift(nag);
      return arr;
    }, peg$c70 = "$", peg$c71 = peg$literalExpectation("$", false), peg$c72 = function(num) {
      return "$" + num;
    }, peg$c73 = "!!", peg$c74 = peg$literalExpectation("!!", false), peg$c75 = function() {
      return "$3";
    }, peg$c76 = "??", peg$c77 = peg$literalExpectation("??", false), peg$c78 = function() {
      return "$4";
    }, peg$c79 = "!?", peg$c80 = peg$literalExpectation("!?", false), peg$c81 = function() {
      return "$5";
    }, peg$c82 = "?!", peg$c83 = peg$literalExpectation("?!", false), peg$c84 = function() {
      return "$6";
    }, peg$c85 = "!", peg$c86 = peg$literalExpectation("!", false), peg$c87 = function() {
      return "$1";
    }, peg$c88 = "?", peg$c89 = peg$literalExpectation("?", false), peg$c90 = function() {
      return "$2";
    }, peg$c91 = "\u203C", peg$c92 = peg$literalExpectation("\u203C", false), peg$c93 = "\u2047", peg$c94 = peg$literalExpectation("\u2047", false), peg$c95 = "\u2049", peg$c96 = peg$literalExpectation("\u2049", false), peg$c97 = "\u2048", peg$c98 = peg$literalExpectation("\u2048", false), peg$c99 = "\u25A1", peg$c100 = peg$literalExpectation("\u25A1", false), peg$c101 = function() {
      return "$7";
    }, peg$c102 = function() {
      return "$10";
    }, peg$c103 = "\u221E", peg$c104 = peg$literalExpectation("\u221E", false), peg$c105 = function() {
      return "$13";
    }, peg$c106 = "\u2A72", peg$c107 = peg$literalExpectation("\u2A72", false), peg$c108 = function() {
      return "$14";
    }, peg$c109 = "\u2A71", peg$c110 = peg$literalExpectation("\u2A71", false), peg$c111 = function() {
      return "$15";
    }, peg$c112 = "\xB1", peg$c113 = peg$literalExpectation("\xB1", false), peg$c114 = function() {
      return "$16";
    }, peg$c115 = "\u2213", peg$c116 = peg$literalExpectation("\u2213", false), peg$c117 = function() {
      return "$17";
    }, peg$c118 = function() {
      return "$18";
    }, peg$c119 = "-+", peg$c120 = peg$literalExpectation("-+", false), peg$c121 = function() {
      return "$19";
    }, peg$c122 = "\u2A00", peg$c123 = peg$literalExpectation("\u2A00", false), peg$c124 = function() {
      return "$22";
    }, peg$c125 = "\u27F3", peg$c126 = peg$literalExpectation("\u27F3", false), peg$c127 = function() {
      return "$32";
    }, peg$c128 = "\u2192", peg$c129 = peg$literalExpectation("\u2192", false), peg$c130 = function() {
      return "$36";
    }, peg$c131 = "\u2191", peg$c132 = peg$literalExpectation("\u2191", false), peg$c133 = function() {
      return "$40";
    }, peg$c134 = "\u21C6", peg$c135 = peg$literalExpectation("\u21C6", false), peg$c136 = function() {
      return "$132";
    }, peg$c137 = "D", peg$c138 = peg$literalExpectation("D", false), peg$c139 = function() {
      return "$220";
    }, peg$c140 = /^[RNBQKP]/, peg$c141 = peg$classExpectation(["R", "N", "B", "Q", "K", "P"], false, false), peg$c142 = /^[a-h]/, peg$c143 = peg$classExpectation([["a", "h"]], false, false), peg$c144 = /^[1-8]/, peg$c145 = peg$classExpectation([["1", "8"]], false, false), peg$c146 = "x", peg$c147 = peg$literalExpectation("x", false), peg$c148 = "-", peg$c149 = peg$literalExpectation("-", false), peg$currPos = 0, peg$savedPos = 0, peg$posDetailsCache = [{ line: 1, column: 1 }], peg$maxFailPos = 0, peg$maxFailExpected = [], peg$silentFails = 0, peg$result;
    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
      }
      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }
    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function expected(description, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildStructuredError(
        [peg$otherExpectation(description)],
        input.substring(peg$savedPos, peg$currPos),
        location2
      );
    }
    function error(message, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildSimpleError(message, location2);
    }
    function peg$literalExpectation(text2, ignoreCase) {
      return { type: "literal", text: text2, ignoreCase };
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts, inverted, ignoreCase };
    }
    function peg$anyExpectation() {
      return { type: "any" };
    }
    function peg$endExpectation() {
      return { type: "end" };
    }
    function peg$otherExpectation(description) {
      return { type: "other", description };
    }
    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos], p;
      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }
        details = peg$posDetailsCache[p];
        details = {
          line: details.line,
          column: details.column
        };
        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
          p++;
        }
        peg$posDetailsCache[pos] = details;
        return details;
      }
    }
    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos), endPosDetails = peg$computePosDetails(endPos);
      return {
        start: {
          offset: startPos,
          line: startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line: endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }
    function peg$fail(expected2) {
      if (peg$currPos < peg$maxFailPos) {
        return;
      }
      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }
      peg$maxFailExpected.push(expected2);
    }
    function peg$buildSimpleError(message, location2) {
      return new peg$SyntaxError(message, null, null, location2);
    }
    function peg$buildStructuredError(expected2, found, location2) {
      return new peg$SyntaxError(
        peg$SyntaxError.buildMessage(expected2, found),
        expected2,
        found,
        location2
      );
    }
    function peg$parsepgn() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = peg$parsepgnStartWhite();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepgnBlack();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c0(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsepgnStartBlack();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsepgnWhite();
          if (s2 === peg$FAILED) {
            s2 = null;
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c1(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsewhiteSpace();
          if (s1 === peg$FAILED) {
            s1 = null;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c2();
          }
          s0 = s1;
        }
      }
      return s0;
    }
    function peg$parsepgnStartWhite() {
      var s0, s1;
      s0 = peg$currPos;
      s1 = peg$parsepgnWhite();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c3(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parsepgnStartBlack() {
      var s0, s1;
      s0 = peg$currPos;
      s1 = peg$parsepgnBlack();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c4(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parsepgnWhite() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;
      s0 = peg$currPos;
      s1 = peg$parsewhiteSpace();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsecomment();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsewhiteSpace();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemoveNumber();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsewhiteSpace();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsecomment();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsewhiteSpace();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsehalfMove();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsewhiteSpace();
                      if (s9 === peg$FAILED) {
                        s9 = null;
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parsenags();
                        if (s10 === peg$FAILED) {
                          s10 = null;
                        }
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsewhiteSpace();
                          if (s11 === peg$FAILED) {
                            s11 = null;
                          }
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parsecomment();
                            if (s12 === peg$FAILED) {
                              s12 = null;
                            }
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parsewhiteSpace();
                              if (s13 === peg$FAILED) {
                                s13 = null;
                              }
                              if (s13 !== peg$FAILED) {
                                s14 = peg$parsevariationWhite();
                                if (s14 === peg$FAILED) {
                                  s14 = null;
                                }
                                if (s14 !== peg$FAILED) {
                                  s15 = peg$parsepgnBlack();
                                  if (s15 === peg$FAILED) {
                                    s15 = null;
                                  }
                                  if (s15 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c5(s2, s4, s6, s8, s10, s12, s14, s15);
                                    s0 = s1;
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseendGame();
      }
      return s0;
    }
    function peg$parsepgnBlack() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;
      s0 = peg$currPos;
      s1 = peg$parsewhiteSpace();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsecomment();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsewhiteSpace();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemoveEllipse();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsewhiteSpace();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsecomment();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsewhiteSpace();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsehalfMove();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsewhiteSpace();
                      if (s9 === peg$FAILED) {
                        s9 = null;
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parsenags();
                        if (s10 === peg$FAILED) {
                          s10 = null;
                        }
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsewhiteSpace();
                          if (s11 === peg$FAILED) {
                            s11 = null;
                          }
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parsecomment();
                            if (s12 === peg$FAILED) {
                              s12 = null;
                            }
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parsewhiteSpace();
                              if (s13 === peg$FAILED) {
                                s13 = null;
                              }
                              if (s13 !== peg$FAILED) {
                                s14 = peg$parsevariationBlack();
                                if (s14 === peg$FAILED) {
                                  s14 = null;
                                }
                                if (s14 !== peg$FAILED) {
                                  s15 = peg$parsepgnWhite();
                                  if (s15 === peg$FAILED) {
                                    s15 = null;
                                  }
                                  if (s15 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c6(s2, s4, s6, s8, s10, s12, s14, s15);
                                    s0 = s1;
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseendGame();
      }
      return s0;
    }
    function peg$parseendGame() {
      var s0, s1;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c7) {
        s1 = peg$c7;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c8);
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c9();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c10) {
          s1 = peg$c10;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c11);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c12();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 3) === peg$c13) {
            s1 = peg$c13;
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c14);
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c15();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c16) {
              s1 = peg$c16;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c17);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c18();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 7) === peg$c19) {
                s1 = peg$c19;
                peg$currPos += 7;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c20);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c21();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 42) {
                  s1 = peg$c22;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c23);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c24();
                }
                s0 = s1;
              }
            }
          }
        }
      }
      return s0;
    }
    function peg$parsecomment() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parsecl();
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c25.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c26);
          }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c25.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c26);
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecr();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c27(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsecl() {
      var s0;
      if (input.charCodeAt(peg$currPos) === 123) {
        s0 = peg$c28;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c29);
        }
      }
      return s0;
    }
    function peg$parsecr() {
      var s0;
      if (input.charCodeAt(peg$currPos) === 125) {
        s0 = peg$c30;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c31);
        }
      }
      return s0;
    }
    function peg$parsevariationWhite() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parsepl();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepgnWhite();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsepr();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsevariationWhite();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parsewhiteSpace();
                if (s6 === peg$FAILED) {
                  s6 = null;
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsemoveEllipse();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c32(s2, s5, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsevariationBlack() {
      var s0, s1, s2, s3, s4, s5;
      s0 = peg$currPos;
      s1 = peg$parsepl();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsepgnStartBlack();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsepr();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsewhiteSpace();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsevariationBlack();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c33(s2, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsepl() {
      var s0;
      if (input.charCodeAt(peg$currPos) === 40) {
        s0 = peg$c34;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c35);
        }
      }
      return s0;
    }
    function peg$parsepr() {
      var s0;
      if (input.charCodeAt(peg$currPos) === 41) {
        s0 = peg$c36;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c37);
        }
      }
      return s0;
    }
    function peg$parsemoveNumber() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = peg$parseinteger();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s2 = peg$c38;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c39);
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c40(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseinteger() {
      var s0, s1, s2;
      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (peg$c42.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c43);
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c42.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c43);
            }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c44(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c41);
        }
      }
      return s0;
    }
    function peg$parsewhiteSpace() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c45;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c46);
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c45;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c46);
            }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c47();
      }
      s0 = s1;
      return s0;
    }
    function peg$parsehalfMove() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;
      s0 = peg$currPos;
      s1 = peg$parsefigure();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parsecheckdisc();
        peg$silentFails--;
        if (s3 !== peg$FAILED) {
          peg$currPos = s2;
          s2 = void 0;
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsediscriminator();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsestrike();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsecolumn();
              if (s5 !== peg$FAILED) {
                s6 = peg$parserow();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsepromotion();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsecheck();
                    if (s8 === peg$FAILED) {
                      s8 = null;
                    }
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c48(s1, s3, s4, s5, s6, s7, s8);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsefigure();
        if (s1 === peg$FAILED) {
          s1 = null;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsecolumn();
          if (s2 !== peg$FAILED) {
            s3 = peg$parserow();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsestrikeOrDash();
              if (s4 === peg$FAILED) {
                s4 = null;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsecolumn();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parserow();
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsepromotion();
                    if (s7 === peg$FAILED) {
                      s7 = null;
                    }
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parsecheck();
                      if (s8 === peg$FAILED) {
                        s8 = null;
                      }
                      if (s8 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c49(s1, s2, s3, s4, s5, s6, s7, s8);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsefigure();
          if (s1 === peg$FAILED) {
            s1 = null;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsestrike();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parsecolumn();
              if (s3 !== peg$FAILED) {
                s4 = peg$parserow();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsepromotion();
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsecheck();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    if (s6 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c50(s1, s2, s3, s4, s5, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 5) === peg$c51) {
              s1 = peg$c51;
              peg$currPos += 5;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c52);
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecheck();
              if (s2 === peg$FAILED) {
                s2 = null;
              }
              if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c53(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c54) {
                s1 = peg$c54;
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c55);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsecheck();
                if (s2 === peg$FAILED) {
                  s2 = null;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c56(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            }
          }
        }
      }
      return s0;
    }
    function peg$parsecheck() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$currPos;
      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c57) {
        s3 = peg$c57;
        peg$currPos += 2;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c58);
        }
      }
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 43) {
          s3 = peg$c59;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c60);
          }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c61(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 3) === peg$c62) {
          s3 = peg$c62;
          peg$currPos += 3;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c63);
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 35) {
            s3 = peg$c64;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c65);
            }
          }
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c61(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parsepromotion() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s1 = peg$c66;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c67);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsefigure();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c68(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsenags() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parsenag();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsewhiteSpace();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenags();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c69(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsenag() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 36) {
        s1 = peg$c70;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c71);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinteger();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c72(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c73) {
          s1 = peg$c73;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c74);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c75();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c76) {
            s1 = peg$c76;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c77);
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c78();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c79) {
              s1 = peg$c79;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c80);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c81();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c82) {
                s1 = peg$c82;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c83);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c84();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 33) {
                  s1 = peg$c85;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c86);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c87();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 63) {
                    s1 = peg$c88;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c89);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c90();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 8252) {
                      s1 = peg$c91;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c92);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c75();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 8263) {
                        s1 = peg$c93;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$c94);
                        }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c78();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 8265) {
                          s1 = peg$c95;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$c96);
                          }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c81();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 8264) {
                            s1 = peg$c97;
                            peg$currPos++;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$c98);
                            }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c84();
                          }
                          s0 = s1;
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 9633) {
                              s1 = peg$c99;
                              peg$currPos++;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$c100);
                              }
                            }
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c101();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.charCodeAt(peg$currPos) === 61) {
                                s1 = peg$c66;
                                peg$currPos++;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$c67);
                                }
                              }
                              if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c102();
                              }
                              s0 = s1;
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 8734) {
                                  s1 = peg$c103;
                                  peg$currPos++;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$c104);
                                  }
                                }
                                if (s1 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$c105();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  if (input.charCodeAt(peg$currPos) === 10866) {
                                    s1 = peg$c106;
                                    peg$currPos++;
                                  } else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                      peg$fail(peg$c107);
                                    }
                                  }
                                  if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c108();
                                  }
                                  s0 = s1;
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 10865) {
                                      s1 = peg$c109;
                                      peg$currPos++;
                                    } else {
                                      s1 = peg$FAILED;
                                      if (peg$silentFails === 0) {
                                        peg$fail(peg$c110);
                                      }
                                    }
                                    if (s1 !== peg$FAILED) {
                                      peg$savedPos = s0;
                                      s1 = peg$c111();
                                    }
                                    s0 = s1;
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      if (input.charCodeAt(peg$currPos) === 177) {
                                        s1 = peg$c112;
                                        peg$currPos++;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                          peg$fail(peg$c113);
                                        }
                                      }
                                      if (s1 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$c114();
                                      }
                                      s0 = s1;
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 8723) {
                                          s1 = peg$c115;
                                          peg$currPos++;
                                        } else {
                                          s1 = peg$FAILED;
                                          if (peg$silentFails === 0) {
                                            peg$fail(peg$c116);
                                          }
                                        }
                                        if (s1 !== peg$FAILED) {
                                          peg$savedPos = s0;
                                          s1 = peg$c117();
                                        }
                                        s0 = s1;
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$currPos;
                                          if (input.substr(peg$currPos, 2) === peg$c57) {
                                            s1 = peg$c57;
                                            peg$currPos += 2;
                                          } else {
                                            s1 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                              peg$fail(peg$c58);
                                            }
                                          }
                                          if (s1 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$c118();
                                          }
                                          s0 = s1;
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            if (input.substr(peg$currPos, 2) === peg$c119) {
                                              s1 = peg$c119;
                                              peg$currPos += 2;
                                            } else {
                                              s1 = peg$FAILED;
                                              if (peg$silentFails === 0) {
                                                peg$fail(peg$c120);
                                              }
                                            }
                                            if (s1 !== peg$FAILED) {
                                              peg$savedPos = s0;
                                              s1 = peg$c121();
                                            }
                                            s0 = s1;
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$currPos;
                                              if (input.charCodeAt(peg$currPos) === 10752) {
                                                s1 = peg$c122;
                                                peg$currPos++;
                                              } else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                  peg$fail(peg$c123);
                                                }
                                              }
                                              if (s1 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c124();
                                              }
                                              s0 = s1;
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                if (input.charCodeAt(peg$currPos) === 10227) {
                                                  s1 = peg$c125;
                                                  peg$currPos++;
                                                } else {
                                                  s1 = peg$FAILED;
                                                  if (peg$silentFails === 0) {
                                                    peg$fail(peg$c126);
                                                  }
                                                }
                                                if (s1 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s1 = peg$c127();
                                                }
                                                s0 = s1;
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$currPos;
                                                  if (input.charCodeAt(peg$currPos) === 8594) {
                                                    s1 = peg$c128;
                                                    peg$currPos++;
                                                  } else {
                                                    s1 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                      peg$fail(peg$c129);
                                                    }
                                                  }
                                                  if (s1 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s1 = peg$c130();
                                                  }
                                                  s0 = s1;
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$currPos;
                                                    if (input.charCodeAt(peg$currPos) === 8593) {
                                                      s1 = peg$c131;
                                                      peg$currPos++;
                                                    } else {
                                                      s1 = peg$FAILED;
                                                      if (peg$silentFails === 0) {
                                                        peg$fail(peg$c132);
                                                      }
                                                    }
                                                    if (s1 !== peg$FAILED) {
                                                      peg$savedPos = s0;
                                                      s1 = peg$c133();
                                                    }
                                                    s0 = s1;
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$currPos;
                                                      if (input.charCodeAt(peg$currPos) === 8646) {
                                                        s1 = peg$c134;
                                                        peg$currPos++;
                                                      } else {
                                                        s1 = peg$FAILED;
                                                        if (peg$silentFails === 0) {
                                                          peg$fail(peg$c135);
                                                        }
                                                      }
                                                      if (s1 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s1 = peg$c136();
                                                      }
                                                      s0 = s1;
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$currPos;
                                                        if (input.charCodeAt(peg$currPos) === 68) {
                                                          s1 = peg$c137;
                                                          peg$currPos++;
                                                        } else {
                                                          s1 = peg$FAILED;
                                                          if (peg$silentFails === 0) {
                                                            peg$fail(peg$c138);
                                                          }
                                                        }
                                                        if (s1 !== peg$FAILED) {
                                                          peg$savedPos = s0;
                                                          s1 = peg$c139();
                                                        }
                                                        s0 = s1;
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return s0;
    }
    function peg$parsediscriminator() {
      var s0;
      s0 = peg$parsecolumn();
      if (s0 === peg$FAILED) {
        s0 = peg$parserow();
      }
      return s0;
    }
    function peg$parsecheckdisc() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      s1 = peg$parsediscriminator();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsestrike();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecolumn();
          if (s3 !== peg$FAILED) {
            s4 = peg$parserow();
            if (s4 !== peg$FAILED) {
              s1 = [s1, s2, s3, s4];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsemoveEllipse() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parseinteger();
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 46) {
          s3 = peg$c38;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c39);
          }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (input.charCodeAt(peg$currPos) === 46) {
              s3 = peg$c38;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c39);
              }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c40(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsefigure() {
      var s0;
      if (peg$c140.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c141);
        }
      }
      return s0;
    }
    function peg$parsecolumn() {
      var s0;
      if (peg$c142.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c143);
        }
      }
      return s0;
    }
    function peg$parserow() {
      var s0;
      if (peg$c144.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c145);
        }
      }
      return s0;
    }
    function peg$parsestrike() {
      var s0;
      if (input.charCodeAt(peg$currPos) === 120) {
        s0 = peg$c146;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c147);
        }
      }
      return s0;
    }
    function peg$parsestrikeOrDash() {
      var s0;
      if (input.charCodeAt(peg$currPos) === 120) {
        s0 = peg$c146;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c147);
        }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s0 = peg$c148;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c149);
          }
        }
      }
      return s0;
    }
    function makeInteger(o) {
      return parseInt(o.join(""), 10);
    }
    peg$result = peg$startRuleFunction();
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }
      throw peg$buildStructuredError(
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }
  var pgnParser = class {
    static parse(history, options) {
      return peg$parse(history, options);
    }
  };

  // node_modules/chess.js/dist/esm/chess.js
  var WHITE = "w";
  var BLACK = "b";
  var PAWN = "p";
  var KNIGHT = "n";
  var BISHOP = "b";
  var ROOK = "r";
  var QUEEN = "q";
  var KING = "k";
  var DEFAULT_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  var Move = class {
    color;
    from;
    to;
    piece;
    captured;
    promotion;
    /**
     * @deprecated This field is deprecated and will be removed in version 2.0.0.
     * Please use move descriptor functions instead: `isCapture`, `isPromotion`,
     * `isEnPassant`, `isKingsideCastle`, `isQueensideCastle`, `isCastle`, and
     * `isBigPawn`
     */
    flags;
    san;
    lan;
    before;
    after;
    constructor(chess, internal) {
      const { color, piece, from, to, flags, captured, promotion } = internal;
      const fromAlgebraic = algebraic(from);
      const toAlgebraic = algebraic(to);
      this.color = color;
      this.piece = piece;
      this.from = fromAlgebraic;
      this.to = toAlgebraic;
      this.san = chess["_moveToSan"](internal, chess["_moves"]({ legal: true }));
      this.lan = fromAlgebraic + toAlgebraic;
      this.before = chess.fen();
      chess["_makeMove"](internal);
      this.after = chess.fen();
      chess["_undoMove"]();
      this.flags = "";
      for (const flag in BITS) {
        if (BITS[flag] & flags) {
          this.flags += FLAGS[flag];
        }
      }
      if (captured) {
        this.captured = captured;
      }
      if (promotion) {
        this.promotion = promotion;
        this.lan += promotion;
      }
    }
    isCapture() {
      return this.flags.indexOf(FLAGS["CAPTURE"]) > -1;
    }
    isPromotion() {
      return this.flags.indexOf(FLAGS["PROMOTION"]) > -1;
    }
    isEnPassant() {
      return this.flags.indexOf(FLAGS["EP_CAPTURE"]) > -1;
    }
    isKingsideCastle() {
      return this.flags.indexOf(FLAGS["KSIDE_CASTLE"]) > -1;
    }
    isQueensideCastle() {
      return this.flags.indexOf(FLAGS["QSIDE_CASTLE"]) > -1;
    }
    isBigPawn() {
      return this.flags.indexOf(FLAGS["BIG_PAWN"]) > -1;
    }
  };
  var EMPTY = -1;
  var FLAGS = {
    NORMAL: "n",
    CAPTURE: "c",
    BIG_PAWN: "b",
    EP_CAPTURE: "e",
    PROMOTION: "p",
    KSIDE_CASTLE: "k",
    QSIDE_CASTLE: "q"
  };
  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
  };
  var Ox88 = {
    a8: 0,
    b8: 1,
    c8: 2,
    d8: 3,
    e8: 4,
    f8: 5,
    g8: 6,
    h8: 7,
    a7: 16,
    b7: 17,
    c7: 18,
    d7: 19,
    e7: 20,
    f7: 21,
    g7: 22,
    h7: 23,
    a6: 32,
    b6: 33,
    c6: 34,
    d6: 35,
    e6: 36,
    f6: 37,
    g6: 38,
    h6: 39,
    a5: 48,
    b5: 49,
    c5: 50,
    d5: 51,
    e5: 52,
    f5: 53,
    g5: 54,
    h5: 55,
    a4: 64,
    b4: 65,
    c4: 66,
    d4: 67,
    e4: 68,
    f4: 69,
    g4: 70,
    h4: 71,
    a3: 80,
    b3: 81,
    c3: 82,
    d3: 83,
    e3: 84,
    f3: 85,
    g3: 86,
    h3: 87,
    a2: 96,
    b2: 97,
    c2: 98,
    d2: 99,
    e2: 100,
    f2: 101,
    g2: 102,
    h2: 103,
    a1: 112,
    b1: 113,
    c1: 114,
    d1: 115,
    e1: 116,
    f1: 117,
    g1: 118,
    h1: 119
  };
  var PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15]
  };
  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1]
  };
  var ATTACKS = [
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    24,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    2,
    24,
    2,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    53,
    56,
    53,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    24,
    24,
    24,
    56,
    0,
    56,
    24,
    24,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    53,
    56,
    53,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    2,
    24,
    2,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    24,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    20
  ];
  var RAYS = [
    17,
    0,
    0,
    0,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    0,
    0,
    0,
    15,
    0,
    0,
    17,
    0,
    0,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    17,
    0,
    0,
    16,
    0,
    0,
    15,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    17,
    0,
    16,
    0,
    15,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    17,
    16,
    15,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -15,
    -16,
    -17,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -15,
    0,
    -16,
    0,
    -17,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -15,
    0,
    0,
    -16,
    0,
    0,
    -17,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    -15,
    0,
    0,
    0,
    -16,
    0,
    0,
    0,
    -17,
    0,
    0,
    0,
    0,
    0,
    0,
    -15,
    0,
    0,
    0,
    0,
    -16,
    0,
    0,
    0,
    0,
    -17,
    0,
    0,
    0,
    0,
    -15,
    0,
    0,
    0,
    0,
    0,
    -16,
    0,
    0,
    0,
    0,
    0,
    -17,
    0,
    0,
    -15,
    0,
    0,
    0,
    0,
    0,
    0,
    -16,
    0,
    0,
    0,
    0,
    0,
    0,
    -17
  ];
  var PIECE_MASKS = { p: 1, n: 2, b: 4, r: 8, q: 16, k: 32 };
  var SYMBOLS = "pnbrqkPNBRQK";
  var PROMOTIONS = [KNIGHT, BISHOP, ROOK, QUEEN];
  var RANK_1 = 7;
  var RANK_2 = 6;
  var RANK_7 = 1;
  var RANK_8 = 0;
  var SIDES = {
    [KING]: BITS.KSIDE_CASTLE,
    [QUEEN]: BITS.QSIDE_CASTLE
  };
  var ROOKS = {
    w: [
      { square: Ox88.a1, flag: BITS.QSIDE_CASTLE },
      { square: Ox88.h1, flag: BITS.KSIDE_CASTLE }
    ],
    b: [
      { square: Ox88.a8, flag: BITS.QSIDE_CASTLE },
      { square: Ox88.h8, flag: BITS.KSIDE_CASTLE }
    ]
  };
  var SECOND_RANK = { b: RANK_7, w: RANK_2 };
  var TERMINATION_MARKERS = ["1-0", "0-1", "1/2-1/2", "*"];
  function rank(square) {
    return square >> 4;
  }
  function file(square) {
    return square & 15;
  }
  function isDigit(c) {
    return "0123456789".indexOf(c) !== -1;
  }
  function algebraic(square) {
    const f = file(square);
    const r = rank(square);
    return "abcdefgh".substring(f, f + 1) + "87654321".substring(r, r + 1);
  }
  function swapColor(color) {
    return color === WHITE ? BLACK : WHITE;
  }
  function validateFen(fen) {
    const tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
      return {
        ok: false,
        error: "Invalid FEN: must contain six space-delimited fields"
      };
    }
    const moveNumber = parseInt(tokens[5], 10);
    if (isNaN(moveNumber) || moveNumber <= 0) {
      return {
        ok: false,
        error: "Invalid FEN: move number must be a positive integer"
      };
    }
    const halfMoves = parseInt(tokens[4], 10);
    if (isNaN(halfMoves) || halfMoves < 0) {
      return {
        ok: false,
        error: "Invalid FEN: half move counter number must be a non-negative integer"
      };
    }
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return { ok: false, error: "Invalid FEN: en-passant square is invalid" };
    }
    if (/[^kKqQ-]/.test(tokens[2])) {
      return { ok: false, error: "Invalid FEN: castling availability is invalid" };
    }
    if (!/^(w|b)$/.test(tokens[1])) {
      return { ok: false, error: "Invalid FEN: side-to-move is invalid" };
    }
    const rows = tokens[0].split("/");
    if (rows.length !== 8) {
      return {
        ok: false,
        error: "Invalid FEN: piece data does not contain 8 '/'-delimited rows"
      };
    }
    for (let i = 0; i < rows.length; i++) {
      let sumFields = 0;
      let previousWasNumber = false;
      for (let k = 0; k < rows[i].length; k++) {
        if (isDigit(rows[i][k])) {
          if (previousWasNumber) {
            return {
              ok: false,
              error: "Invalid FEN: piece data is invalid (consecutive number)"
            };
          }
          sumFields += parseInt(rows[i][k], 10);
          previousWasNumber = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return {
              ok: false,
              error: "Invalid FEN: piece data is invalid (invalid piece)"
            };
          }
          sumFields += 1;
          previousWasNumber = false;
        }
      }
      if (sumFields !== 8) {
        return {
          ok: false,
          error: "Invalid FEN: piece data is invalid (too many squares in rank)"
        };
      }
    }
    if (tokens[3][1] == "3" && tokens[1] == "w" || tokens[3][1] == "6" && tokens[1] == "b") {
      return { ok: false, error: "Invalid FEN: illegal en-passant square" };
    }
    const kings = [
      { color: "white", regex: /K/g },
      { color: "black", regex: /k/g }
    ];
    for (const { color, regex } of kings) {
      if (!regex.test(tokens[0])) {
        return { ok: false, error: `Invalid FEN: missing ${color} king` };
      }
      if ((tokens[0].match(regex) || []).length > 1) {
        return { ok: false, error: `Invalid FEN: too many ${color} kings` };
      }
    }
    if (Array.from(rows[0] + rows[7]).some((char) => char.toUpperCase() === "P")) {
      return {
        ok: false,
        error: "Invalid FEN: some pawns are on the edge rows"
      };
    }
    return { ok: true };
  }
  function getDisambiguator(move, moves) {
    const from = move.from;
    const to = move.to;
    const piece = move.piece;
    let ambiguities = 0;
    let sameRank = 0;
    let sameFile = 0;
    for (let i = 0, len = moves.length; i < len; i++) {
      const ambigFrom = moves[i].from;
      const ambigTo = moves[i].to;
      const ambigPiece = moves[i].piece;
      if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {
        ambiguities++;
        if (rank(from) === rank(ambigFrom)) {
          sameRank++;
        }
        if (file(from) === file(ambigFrom)) {
          sameFile++;
        }
      }
    }
    if (ambiguities > 0) {
      if (sameRank > 0 && sameFile > 0) {
        return algebraic(from);
      } else if (sameFile > 0) {
        return algebraic(from).charAt(1);
      } else {
        return algebraic(from).charAt(0);
      }
    }
    return "";
  }
  function addMove(moves, color, from, to, piece, captured = void 0, flags = BITS.NORMAL) {
    const r = rank(to);
    if (piece === PAWN && (r === RANK_1 || r === RANK_8)) {
      for (let i = 0; i < PROMOTIONS.length; i++) {
        const promotion = PROMOTIONS[i];
        moves.push({
          color,
          from,
          to,
          piece,
          captured,
          promotion,
          flags: flags | BITS.PROMOTION
        });
      }
    } else {
      moves.push({
        color,
        from,
        to,
        piece,
        captured,
        flags
      });
    }
  }
  function inferPieceType(san) {
    let pieceType = san.charAt(0);
    if (pieceType >= "a" && pieceType <= "h") {
      const matches = san.match(/[a-h]\d.*[a-h]\d/);
      if (matches) {
        return void 0;
      }
      return PAWN;
    }
    pieceType = pieceType.toLowerCase();
    if (pieceType === "o") {
      return KING;
    }
    return pieceType;
  }
  function strippedSan(move) {
    return move.replace(/=/, "").replace(/[+#]?[?!]*$/, "");
  }
  function trimFen(fen) {
    return fen.split(" ").slice(0, 4).join(" ");
  }
  var Chess = class {
    _board = new Array(128);
    _turn = WHITE;
    _header = {};
    _kings = { w: EMPTY, b: EMPTY };
    _epSquare = -1;
    _halfMoves = 0;
    _moveNumber = 0;
    _history = [];
    _comments = {};
    _castling = { w: 0, b: 0 };
    // tracks number of times a position has been seen for repetition checking
    _positionCount = {};
    constructor(fen = DEFAULT_POSITION, { skipValidation = false } = {}) {
      this.load(fen, { skipValidation });
    }
    clear({ preserveHeaders = false } = {}) {
      this._board = new Array(128);
      this._kings = { w: EMPTY, b: EMPTY };
      this._turn = WHITE;
      this._castling = { w: 0, b: 0 };
      this._epSquare = EMPTY;
      this._halfMoves = 0;
      this._moveNumber = 1;
      this._history = [];
      this._comments = {};
      this._header = preserveHeaders ? this._header : {};
      this._positionCount = {};
      delete this._header["SetUp"];
      delete this._header["FEN"];
    }
    load(fen, { skipValidation = false, preserveHeaders = false } = {}) {
      let tokens = fen.split(/\s+/);
      if (tokens.length >= 2 && tokens.length < 6) {
        const adjustments = ["-", "-", "0", "1"];
        fen = tokens.concat(adjustments.slice(-(6 - tokens.length))).join(" ");
      }
      tokens = fen.split(/\s+/);
      if (!skipValidation) {
        const { ok, error } = validateFen(fen);
        if (!ok) {
          throw new Error(error);
        }
      }
      const position = tokens[0];
      let square = 0;
      this.clear({ preserveHeaders });
      for (let i = 0; i < position.length; i++) {
        const piece = position.charAt(i);
        if (piece === "/") {
          square += 8;
        } else if (isDigit(piece)) {
          square += parseInt(piece, 10);
        } else {
          const color = piece < "a" ? WHITE : BLACK;
          this._put({ type: piece.toLowerCase(), color }, algebraic(square));
          square++;
        }
      }
      this._turn = tokens[1];
      if (tokens[2].indexOf("K") > -1) {
        this._castling.w |= BITS.KSIDE_CASTLE;
      }
      if (tokens[2].indexOf("Q") > -1) {
        this._castling.w |= BITS.QSIDE_CASTLE;
      }
      if (tokens[2].indexOf("k") > -1) {
        this._castling.b |= BITS.KSIDE_CASTLE;
      }
      if (tokens[2].indexOf("q") > -1) {
        this._castling.b |= BITS.QSIDE_CASTLE;
      }
      this._epSquare = tokens[3] === "-" ? EMPTY : Ox88[tokens[3]];
      this._halfMoves = parseInt(tokens[4], 10);
      this._moveNumber = parseInt(tokens[5], 10);
      this._updateSetup(fen);
      this._incPositionCount(fen);
    }
    fen() {
      let empty = 0;
      let fen = "";
      for (let i = Ox88.a8; i <= Ox88.h1; i++) {
        if (this._board[i]) {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          const { color, type: piece } = this._board[i];
          fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
        } else {
          empty++;
        }
        if (i + 1 & 136) {
          if (empty > 0) {
            fen += empty;
          }
          if (i !== Ox88.h1) {
            fen += "/";
          }
          empty = 0;
          i += 8;
        }
      }
      let castling = "";
      if (this._castling[WHITE] & BITS.KSIDE_CASTLE) {
        castling += "K";
      }
      if (this._castling[WHITE] & BITS.QSIDE_CASTLE) {
        castling += "Q";
      }
      if (this._castling[BLACK] & BITS.KSIDE_CASTLE) {
        castling += "k";
      }
      if (this._castling[BLACK] & BITS.QSIDE_CASTLE) {
        castling += "q";
      }
      castling = castling || "-";
      let epSquare = "-";
      if (this._epSquare !== EMPTY) {
        const bigPawnSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
        const squares = [bigPawnSquare + 1, bigPawnSquare - 1];
        for (const square of squares) {
          if (square & 136) {
            continue;
          }
          const color = this._turn;
          if (this._board[square]?.color === color && this._board[square]?.type === PAWN) {
            this._makeMove({
              color,
              from: square,
              to: this._epSquare,
              piece: PAWN,
              captured: PAWN,
              flags: BITS.EP_CAPTURE
            });
            const isLegal = !this._isKingAttacked(color);
            this._undoMove();
            if (isLegal) {
              epSquare = algebraic(this._epSquare);
              break;
            }
          }
        }
      }
      return [
        fen,
        this._turn,
        castling,
        epSquare,
        this._halfMoves,
        this._moveNumber
      ].join(" ");
    }
    /*
     * Called when the initial board setup is changed with put() or remove().
     * modifies the SetUp and FEN properties of the header object. If the FEN
     * is equal to the default position, the SetUp and FEN are deleted the setup
     * is only updated if history.length is zero, ie moves haven't been made.
     */
    _updateSetup(fen) {
      if (this._history.length > 0)
        return;
      if (fen !== DEFAULT_POSITION) {
        this._header["SetUp"] = "1";
        this._header["FEN"] = fen;
      } else {
        delete this._header["SetUp"];
        delete this._header["FEN"];
      }
    }
    reset() {
      this.load(DEFAULT_POSITION);
    }
    get(square) {
      return this._board[Ox88[square]];
    }
    put({ type, color }, square) {
      if (this._put({ type, color }, square)) {
        this._updateCastlingRights();
        this._updateEnPassantSquare();
        this._updateSetup(this.fen());
        return true;
      }
      return false;
    }
    _put({ type, color }, square) {
      if (SYMBOLS.indexOf(type.toLowerCase()) === -1) {
        return false;
      }
      if (!(square in Ox88)) {
        return false;
      }
      const sq = Ox88[square];
      if (type == KING && !(this._kings[color] == EMPTY || this._kings[color] == sq)) {
        return false;
      }
      const currentPieceOnSquare = this._board[sq];
      if (currentPieceOnSquare && currentPieceOnSquare.type === KING) {
        this._kings[currentPieceOnSquare.color] = EMPTY;
      }
      this._board[sq] = { type, color };
      if (type === KING) {
        this._kings[color] = sq;
      }
      return true;
    }
    remove(square) {
      const piece = this.get(square);
      delete this._board[Ox88[square]];
      if (piece && piece.type === KING) {
        this._kings[piece.color] = EMPTY;
      }
      this._updateCastlingRights();
      this._updateEnPassantSquare();
      this._updateSetup(this.fen());
      return piece;
    }
    _updateCastlingRights() {
      const whiteKingInPlace = this._board[Ox88.e1]?.type === KING && this._board[Ox88.e1]?.color === WHITE;
      const blackKingInPlace = this._board[Ox88.e8]?.type === KING && this._board[Ox88.e8]?.color === BLACK;
      if (!whiteKingInPlace || this._board[Ox88.a1]?.type !== ROOK || this._board[Ox88.a1]?.color !== WHITE) {
        this._castling.w &= ~BITS.QSIDE_CASTLE;
      }
      if (!whiteKingInPlace || this._board[Ox88.h1]?.type !== ROOK || this._board[Ox88.h1]?.color !== WHITE) {
        this._castling.w &= ~BITS.KSIDE_CASTLE;
      }
      if (!blackKingInPlace || this._board[Ox88.a8]?.type !== ROOK || this._board[Ox88.a8]?.color !== BLACK) {
        this._castling.b &= ~BITS.QSIDE_CASTLE;
      }
      if (!blackKingInPlace || this._board[Ox88.h8]?.type !== ROOK || this._board[Ox88.h8]?.color !== BLACK) {
        this._castling.b &= ~BITS.KSIDE_CASTLE;
      }
    }
    _updateEnPassantSquare() {
      if (this._epSquare === EMPTY) {
        return;
      }
      const startSquare = this._epSquare + (this._turn === WHITE ? -16 : 16);
      const currentSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
      const attackers = [currentSquare + 1, currentSquare - 1];
      if (this._board[startSquare] !== null || this._board[this._epSquare] !== null || this._board[currentSquare]?.color !== swapColor(this._turn) || this._board[currentSquare]?.type !== PAWN) {
        this._epSquare = EMPTY;
        return;
      }
      const canCapture = (square) => !(square & 136) && this._board[square]?.color === this._turn && this._board[square]?.type === PAWN;
      if (!attackers.some(canCapture)) {
        this._epSquare = EMPTY;
      }
    }
    _attacked(color, square, verbose) {
      const attackers = [];
      for (let i = Ox88.a8; i <= Ox88.h1; i++) {
        if (i & 136) {
          i += 7;
          continue;
        }
        if (this._board[i] === void 0 || this._board[i].color !== color) {
          continue;
        }
        const piece = this._board[i];
        const difference = i - square;
        if (difference === 0) {
          continue;
        }
        const index = difference + 119;
        if (ATTACKS[index] & PIECE_MASKS[piece.type]) {
          if (piece.type === PAWN) {
            if (difference > 0 && piece.color === WHITE || difference <= 0 && piece.color === BLACK) {
              if (!verbose) {
                return true;
              } else {
                attackers.push(algebraic(i));
              }
            }
            continue;
          }
          if (piece.type === "n" || piece.type === "k") {
            if (!verbose) {
              return true;
            } else {
              attackers.push(algebraic(i));
              continue;
            }
          }
          const offset = RAYS[index];
          let j = i + offset;
          let blocked = false;
          while (j !== square) {
            if (this._board[j] != null) {
              blocked = true;
              break;
            }
            j += offset;
          }
          if (!blocked) {
            if (!verbose) {
              return true;
            } else {
              attackers.push(algebraic(i));
              continue;
            }
          }
        }
      }
      if (verbose) {
        return attackers;
      } else {
        return false;
      }
    }
    attackers(square, attackedBy) {
      if (!attackedBy) {
        return this._attacked(this._turn, Ox88[square], true);
      } else {
        return this._attacked(attackedBy, Ox88[square], true);
      }
    }
    _isKingAttacked(color) {
      const square = this._kings[color];
      return square === -1 ? false : this._attacked(swapColor(color), square);
    }
    isAttacked(square, attackedBy) {
      return this._attacked(attackedBy, Ox88[square]);
    }
    isCheck() {
      return this._isKingAttacked(this._turn);
    }
    inCheck() {
      return this.isCheck();
    }
    isCheckmate() {
      return this.isCheck() && this._moves().length === 0;
    }
    isStalemate() {
      return !this.isCheck() && this._moves().length === 0;
    }
    isInsufficientMaterial() {
      const pieces = {
        b: 0,
        n: 0,
        r: 0,
        q: 0,
        k: 0,
        p: 0
      };
      const bishops = [];
      let numPieces = 0;
      let squareColor = 0;
      for (let i = Ox88.a8; i <= Ox88.h1; i++) {
        squareColor = (squareColor + 1) % 2;
        if (i & 136) {
          i += 7;
          continue;
        }
        const piece = this._board[i];
        if (piece) {
          pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
          if (piece.type === BISHOP) {
            bishops.push(squareColor);
          }
          numPieces++;
        }
      }
      if (numPieces === 2) {
        return true;
      } else if (
        // k vs. kn .... or .... k vs. kb
        numPieces === 3 && (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
      ) {
        return true;
      } else if (numPieces === pieces[BISHOP] + 2) {
        let sum = 0;
        const len = bishops.length;
        for (let i = 0; i < len; i++) {
          sum += bishops[i];
        }
        if (sum === 0 || sum === len) {
          return true;
        }
      }
      return false;
    }
    isThreefoldRepetition() {
      return this._getPositionCount(this.fen()) >= 3;
    }
    isDrawByFiftyMoves() {
      return this._halfMoves >= 100;
    }
    isDraw() {
      return this.isDrawByFiftyMoves() || this.isStalemate() || this.isInsufficientMaterial() || this.isThreefoldRepetition();
    }
    isGameOver() {
      return this.isCheckmate() || this.isStalemate() || this.isDraw();
    }
    moves({ verbose = false, square = void 0, piece = void 0 } = {}) {
      const moves = this._moves({ square, piece });
      if (verbose) {
        return moves.map((move) => new Move(this, move));
      } else {
        return moves.map((move) => this._moveToSan(move, moves));
      }
    }
    _moves({ legal = true, piece = void 0, square = void 0 } = {}) {
      const forSquare = square ? square.toLowerCase() : void 0;
      const forPiece = piece?.toLowerCase();
      const moves = [];
      const us = this._turn;
      const them = swapColor(us);
      let firstSquare = Ox88.a8;
      let lastSquare = Ox88.h1;
      let singleSquare = false;
      if (forSquare) {
        if (!(forSquare in Ox88)) {
          return [];
        } else {
          firstSquare = lastSquare = Ox88[forSquare];
          singleSquare = true;
        }
      }
      for (let from = firstSquare; from <= lastSquare; from++) {
        if (from & 136) {
          from += 7;
          continue;
        }
        if (!this._board[from] || this._board[from].color === them) {
          continue;
        }
        const { type } = this._board[from];
        let to;
        if (type === PAWN) {
          if (forPiece && forPiece !== type)
            continue;
          to = from + PAWN_OFFSETS[us][0];
          if (!this._board[to]) {
            addMove(moves, us, from, to, PAWN);
            to = from + PAWN_OFFSETS[us][1];
            if (SECOND_RANK[us] === rank(from) && !this._board[to]) {
              addMove(moves, us, from, to, PAWN, void 0, BITS.BIG_PAWN);
            }
          }
          for (let j = 2; j < 4; j++) {
            to = from + PAWN_OFFSETS[us][j];
            if (to & 136)
              continue;
            if (this._board[to]?.color === them) {
              addMove(moves, us, from, to, PAWN, this._board[to].type, BITS.CAPTURE);
            } else if (to === this._epSquare) {
              addMove(moves, us, from, to, PAWN, PAWN, BITS.EP_CAPTURE);
            }
          }
        } else {
          if (forPiece && forPiece !== type)
            continue;
          for (let j = 0, len = PIECE_OFFSETS[type].length; j < len; j++) {
            const offset = PIECE_OFFSETS[type][j];
            to = from;
            while (true) {
              to += offset;
              if (to & 136)
                break;
              if (!this._board[to]) {
                addMove(moves, us, from, to, type);
              } else {
                if (this._board[to].color === us)
                  break;
                addMove(moves, us, from, to, type, this._board[to].type, BITS.CAPTURE);
                break;
              }
              if (type === KNIGHT || type === KING)
                break;
            }
          }
        }
      }
      if (forPiece === void 0 || forPiece === KING) {
        if (!singleSquare || lastSquare === this._kings[us]) {
          if (this._castling[us] & BITS.KSIDE_CASTLE) {
            const castlingFrom = this._kings[us];
            const castlingTo = castlingFrom + 2;
            if (!this._board[castlingFrom + 1] && !this._board[castlingTo] && !this._attacked(them, this._kings[us]) && !this._attacked(them, castlingFrom + 1) && !this._attacked(them, castlingTo)) {
              addMove(moves, us, this._kings[us], castlingTo, KING, void 0, BITS.KSIDE_CASTLE);
            }
          }
          if (this._castling[us] & BITS.QSIDE_CASTLE) {
            const castlingFrom = this._kings[us];
            const castlingTo = castlingFrom - 2;
            if (!this._board[castlingFrom - 1] && !this._board[castlingFrom - 2] && !this._board[castlingFrom - 3] && !this._attacked(them, this._kings[us]) && !this._attacked(them, castlingFrom - 1) && !this._attacked(them, castlingTo)) {
              addMove(moves, us, this._kings[us], castlingTo, KING, void 0, BITS.QSIDE_CASTLE);
            }
          }
        }
      }
      if (!legal || this._kings[us] === -1) {
        return moves;
      }
      const legalMoves = [];
      for (let i = 0, len = moves.length; i < len; i++) {
        this._makeMove(moves[i]);
        if (!this._isKingAttacked(us)) {
          legalMoves.push(moves[i]);
        }
        this._undoMove();
      }
      return legalMoves;
    }
    move(move, { strict = false } = {}) {
      let moveObj = null;
      if (typeof move === "string") {
        moveObj = this._moveFromSan(move, strict);
      } else if (typeof move === "object") {
        const moves = this._moves();
        for (let i = 0, len = moves.length; i < len; i++) {
          if (move.from === algebraic(moves[i].from) && move.to === algebraic(moves[i].to) && (!("promotion" in moves[i]) || move.promotion === moves[i].promotion)) {
            moveObj = moves[i];
            break;
          }
        }
      }
      if (!moveObj) {
        if (typeof move === "string") {
          throw new Error(`Invalid move: ${move}`);
        } else {
          throw new Error(`Invalid move: ${JSON.stringify(move)}`);
        }
      }
      const prettyMove = new Move(this, moveObj);
      this._makeMove(moveObj);
      this._incPositionCount(prettyMove.after);
      return prettyMove;
    }
    _push(move) {
      this._history.push({
        move,
        kings: { b: this._kings.b, w: this._kings.w },
        turn: this._turn,
        castling: { b: this._castling.b, w: this._castling.w },
        epSquare: this._epSquare,
        halfMoves: this._halfMoves,
        moveNumber: this._moveNumber
      });
    }
    _makeMove(move) {
      const us = this._turn;
      const them = swapColor(us);
      this._push(move);
      this._board[move.to] = this._board[move.from];
      delete this._board[move.from];
      if (move.flags & BITS.EP_CAPTURE) {
        if (this._turn === BLACK) {
          delete this._board[move.to - 16];
        } else {
          delete this._board[move.to + 16];
        }
      }
      if (move.promotion) {
        this._board[move.to] = { type: move.promotion, color: us };
      }
      if (this._board[move.to].type === KING) {
        this._kings[us] = move.to;
        if (move.flags & BITS.KSIDE_CASTLE) {
          const castlingTo = move.to - 1;
          const castlingFrom = move.to + 1;
          this._board[castlingTo] = this._board[castlingFrom];
          delete this._board[castlingFrom];
        } else if (move.flags & BITS.QSIDE_CASTLE) {
          const castlingTo = move.to + 1;
          const castlingFrom = move.to - 2;
          this._board[castlingTo] = this._board[castlingFrom];
          delete this._board[castlingFrom];
        }
        this._castling[us] = 0;
      }
      if (this._castling[us]) {
        for (let i = 0, len = ROOKS[us].length; i < len; i++) {
          if (move.from === ROOKS[us][i].square && this._castling[us] & ROOKS[us][i].flag) {
            this._castling[us] ^= ROOKS[us][i].flag;
            break;
          }
        }
      }
      if (this._castling[them]) {
        for (let i = 0, len = ROOKS[them].length; i < len; i++) {
          if (move.to === ROOKS[them][i].square && this._castling[them] & ROOKS[them][i].flag) {
            this._castling[them] ^= ROOKS[them][i].flag;
            break;
          }
        }
      }
      if (move.flags & BITS.BIG_PAWN) {
        if (us === BLACK) {
          this._epSquare = move.to - 16;
        } else {
          this._epSquare = move.to + 16;
        }
      } else {
        this._epSquare = EMPTY;
      }
      if (move.piece === PAWN) {
        this._halfMoves = 0;
      } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        this._halfMoves = 0;
      } else {
        this._halfMoves++;
      }
      if (us === BLACK) {
        this._moveNumber++;
      }
      this._turn = them;
    }
    undo() {
      const move = this._undoMove();
      if (move) {
        const prettyMove = new Move(this, move);
        this._decPositionCount(prettyMove.after);
        return prettyMove;
      }
      return null;
    }
    _undoMove() {
      const old = this._history.pop();
      if (old === void 0) {
        return null;
      }
      const move = old.move;
      this._kings = old.kings;
      this._turn = old.turn;
      this._castling = old.castling;
      this._epSquare = old.epSquare;
      this._halfMoves = old.halfMoves;
      this._moveNumber = old.moveNumber;
      const us = this._turn;
      const them = swapColor(us);
      this._board[move.from] = this._board[move.to];
      this._board[move.from].type = move.piece;
      delete this._board[move.to];
      if (move.captured) {
        if (move.flags & BITS.EP_CAPTURE) {
          let index;
          if (us === BLACK) {
            index = move.to - 16;
          } else {
            index = move.to + 16;
          }
          this._board[index] = { type: PAWN, color: them };
        } else {
          this._board[move.to] = { type: move.captured, color: them };
        }
      }
      if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
        let castlingTo, castlingFrom;
        if (move.flags & BITS.KSIDE_CASTLE) {
          castlingTo = move.to + 1;
          castlingFrom = move.to - 1;
        } else {
          castlingTo = move.to - 2;
          castlingFrom = move.to + 1;
        }
        this._board[castlingTo] = this._board[castlingFrom];
        delete this._board[castlingFrom];
      }
      return move;
    }
    pgn({ newline = "\n", maxWidth = 0 } = {}) {
      const result = [];
      let headerExists = false;
      for (const i in this._header) {
        result.push("[" + i + ' "' + this._header[i] + '"]' + newline);
        headerExists = true;
      }
      if (headerExists && this._history.length) {
        result.push(newline);
      }
      const appendComment = (moveString2) => {
        const comment = this._comments[this.fen()];
        if (typeof comment !== "undefined") {
          const delimiter = moveString2.length > 0 ? " " : "";
          moveString2 = `${moveString2}${delimiter}{${comment}}`;
        }
        return moveString2;
      };
      const reversedHistory = [];
      while (this._history.length > 0) {
        reversedHistory.push(this._undoMove());
      }
      const moves = [];
      let moveString = "";
      if (reversedHistory.length === 0) {
        moves.push(appendComment(""));
      }
      while (reversedHistory.length > 0) {
        moveString = appendComment(moveString);
        const move = reversedHistory.pop();
        if (!move) {
          break;
        }
        if (!this._history.length && move.color === "b") {
          const prefix = `${this._moveNumber}. ...`;
          moveString = moveString ? `${moveString} ${prefix}` : prefix;
        } else if (move.color === "w") {
          if (moveString.length) {
            moves.push(moveString);
          }
          moveString = this._moveNumber + ".";
        }
        moveString = moveString + " " + this._moveToSan(move, this._moves({ legal: true }));
        this._makeMove(move);
      }
      if (moveString.length) {
        moves.push(appendComment(moveString));
      }
      if (typeof this._header.Result !== "undefined") {
        moves.push(this._header.Result);
      }
      if (maxWidth === 0) {
        return result.join("") + moves.join(" ");
      }
      const strip = function() {
        if (result.length > 0 && result[result.length - 1] === " ") {
          result.pop();
          return true;
        }
        return false;
      };
      const wrapComment = function(width, move) {
        for (const token of move.split(" ")) {
          if (!token) {
            continue;
          }
          if (width + token.length > maxWidth) {
            while (strip()) {
              width--;
            }
            result.push(newline);
            width = 0;
          }
          result.push(token);
          width += token.length;
          result.push(" ");
          width++;
        }
        if (strip()) {
          width--;
        }
        return width;
      };
      let currentWidth = 0;
      for (let i = 0; i < moves.length; i++) {
        if (currentWidth + moves[i].length > maxWidth) {
          if (moves[i].includes("{")) {
            currentWidth = wrapComment(currentWidth, moves[i]);
            continue;
          }
        }
        if (currentWidth + moves[i].length > maxWidth && i !== 0) {
          if (result[result.length - 1] === " ") {
            result.pop();
          }
          result.push(newline);
          currentWidth = 0;
        } else if (i !== 0) {
          result.push(" ");
          currentWidth++;
        }
        result.push(moves[i]);
        currentWidth += moves[i].length;
      }
      return result.join("");
    }
    /*
     * @deprecated Use `setHeader` and `getHeaders` instead.
     */
    header(...args) {
      for (let i = 0; i < args.length; i += 2) {
        if (typeof args[i] === "string" && typeof args[i + 1] === "string") {
          this._header[args[i]] = args[i + 1];
        }
      }
      return this._header;
    }
    setHeader(key, value) {
      this._header[key] = value;
      return this._header;
    }
    removeHeader(key) {
      if (key in this._header) {
        delete this._header[key];
        return true;
      }
      return false;
    }
    getHeaders() {
      return this._header;
    }
    loadPgn(pgn, { strict = false, newlineChar = "\r?\n" } = {}) {
      function mask(str) {
        return str.replace(/\\/g, "\\");
      }
      function parsePgnHeader(header) {
        const headerObj = {};
        const headers2 = header.split(new RegExp(mask(newlineChar)));
        let key = "";
        let value = "";
        for (let i = 0; i < headers2.length; i++) {
          const regex = /^\s*\[\s*([A-Za-z]+)\s*"(.*)"\s*\]\s*$/;
          key = headers2[i].replace(regex, "$1");
          value = headers2[i].replace(regex, "$2");
          if (key.trim().length > 0) {
            headerObj[key] = value;
          }
        }
        return headerObj;
      }
      pgn = pgn.trim();
      const headerRegex = new RegExp("^(\\[((?:" + mask(newlineChar) + ")|.)*\\])((?:\\s*" + mask(newlineChar) + "){2}|(?:\\s*" + mask(newlineChar) + ")*$)");
      const headerRegexResults = headerRegex.exec(pgn);
      const headerString = headerRegexResults ? headerRegexResults.length >= 2 ? headerRegexResults[1] : "" : "";
      this.reset();
      const headers = parsePgnHeader(headerString);
      let fen = "";
      for (const key in headers) {
        if (key.toLowerCase() === "fen") {
          fen = headers[key];
        }
        this.header(key, headers[key]);
      }
      if (!strict) {
        if (fen) {
          this.load(fen, { preserveHeaders: true });
        }
      } else {
        if (headers["SetUp"] === "1") {
          if (!("FEN" in headers)) {
            throw new Error("Invalid PGN: FEN tag must be supplied with SetUp tag");
          }
          this.load(headers["FEN"], { preserveHeaders: true });
        }
      }
      function toHex(s) {
        return Array.from(s).map(function(c) {
          return c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16) : encodeURIComponent(c).replace(/%/g, "").toLowerCase();
        }).join("");
      }
      function fromHex(s) {
        return s.length == 0 ? "" : decodeURIComponent("%" + (s.match(/.{1,2}/g) || []).join("%"));
      }
      const encodeComment = function(s) {
        s = s.replace(new RegExp(mask(newlineChar), "g"), " ");
        return `{${toHex(s.slice(1, s.length - 1))}}`;
      };
      const decodeComment = function(s) {
        if (s.startsWith("{") && s.endsWith("}")) {
          return fromHex(s.slice(1, s.length - 1));
        }
      };
      let ms = pgn.replace(headerString, "").replace(
        // encode comments so they don't get deleted below
        new RegExp(`({[^}]*})+?|;([^${mask(newlineChar)}]*)`, "g"),
        function(_match, bracket, semicolon) {
          return bracket !== void 0 ? encodeComment(bracket) : " " + encodeComment(`{${semicolon.slice(1)}}`);
        }
      ).replace(new RegExp(mask(newlineChar), "g"), " ");
      const ravRegex = /(\([^()]+\))+?/g;
      while (ravRegex.test(ms)) {
        ms = ms.replace(ravRegex, "");
      }
      ms = ms.replace(/\d+\.(\.\.)?/g, "");
      ms = ms.replace(/\.\.\./g, "");
      ms = ms.replace(/\$\d+/g, "");
      let moves = ms.trim().split(new RegExp(/\s+/));
      moves = moves.filter((move) => move !== "");
      let result = "";
      for (let halfMove = 0; halfMove < moves.length; halfMove++) {
        const comment = decodeComment(moves[halfMove]);
        if (comment !== void 0) {
          this._comments[this.fen()] = comment;
          continue;
        }
        const move = this._moveFromSan(moves[halfMove], strict);
        if (move == null) {
          if (TERMINATION_MARKERS.indexOf(moves[halfMove]) > -1) {
            result = moves[halfMove];
          } else {
            throw new Error(`Invalid move in PGN: ${moves[halfMove]}`);
          }
        } else {
          result = "";
          this._makeMove(move);
          this._incPositionCount(this.fen());
        }
      }
      if (result && Object.keys(this._header).length && !this._header["Result"]) {
        this.header("Result", result);
      }
    }
    /*
     * Convert a move from 0x88 coordinates to Standard Algebraic Notation
     * (SAN)
     *
     * @param {boolean} strict Use the strict SAN parser. It will throw errors
     * on overly disambiguated moves (see below):
     *
     * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
     * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
     * 4. ... Ne7 is technically the valid SAN
     */
    _moveToSan(move, moves) {
      let output = "";
      if (move.flags & BITS.KSIDE_CASTLE) {
        output = "O-O";
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        output = "O-O-O";
      } else {
        if (move.piece !== PAWN) {
          const disambiguator = getDisambiguator(move, moves);
          output += move.piece.toUpperCase() + disambiguator;
        }
        if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
          if (move.piece === PAWN) {
            output += algebraic(move.from)[0];
          }
          output += "x";
        }
        output += algebraic(move.to);
        if (move.promotion) {
          output += "=" + move.promotion.toUpperCase();
        }
      }
      this._makeMove(move);
      if (this.isCheck()) {
        if (this.isCheckmate()) {
          output += "#";
        } else {
          output += "+";
        }
      }
      this._undoMove();
      return output;
    }
    // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
    _moveFromSan(move, strict = false) {
      const cleanMove = strippedSan(move);
      let pieceType = inferPieceType(cleanMove);
      let moves = this._moves({ legal: true, piece: pieceType });
      for (let i = 0, len = moves.length; i < len; i++) {
        if (cleanMove === strippedSan(this._moveToSan(moves[i], moves))) {
          return moves[i];
        }
      }
      if (strict) {
        return null;
      }
      let piece = void 0;
      let matches = void 0;
      let from = void 0;
      let to = void 0;
      let promotion = void 0;
      let overlyDisambiguated = false;
      matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);
      if (matches) {
        piece = matches[1];
        from = matches[2];
        to = matches[3];
        promotion = matches[4];
        if (from.length == 1) {
          overlyDisambiguated = true;
        }
      } else {
        matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/);
        if (matches) {
          piece = matches[1];
          from = matches[2];
          to = matches[3];
          promotion = matches[4];
          if (from.length == 1) {
            overlyDisambiguated = true;
          }
        }
      }
      pieceType = inferPieceType(cleanMove);
      moves = this._moves({
        legal: true,
        piece: piece ? piece : pieceType
      });
      if (!to) {
        return null;
      }
      for (let i = 0, len = moves.length; i < len; i++) {
        if (!from) {
          if (cleanMove === strippedSan(this._moveToSan(moves[i], moves)).replace("x", "")) {
            return moves[i];
          }
        } else if ((!piece || piece.toLowerCase() == moves[i].piece) && Ox88[from] == moves[i].from && Ox88[to] == moves[i].to && (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
          return moves[i];
        } else if (overlyDisambiguated) {
          const square = algebraic(moves[i].from);
          if ((!piece || piece.toLowerCase() == moves[i].piece) && Ox88[to] == moves[i].to && (from == square[0] || from == square[1]) && (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
            return moves[i];
          }
        }
      }
      return null;
    }
    ascii() {
      let s = "   +------------------------+\n";
      for (let i = Ox88.a8; i <= Ox88.h1; i++) {
        if (file(i) === 0) {
          s += " " + "87654321"[rank(i)] + " |";
        }
        if (this._board[i]) {
          const piece = this._board[i].type;
          const color = this._board[i].color;
          const symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
          s += " " + symbol + " ";
        } else {
          s += " . ";
        }
        if (i + 1 & 136) {
          s += "|\n";
          i += 8;
        }
      }
      s += "   +------------------------+\n";
      s += "     a  b  c  d  e  f  g  h";
      return s;
    }
    perft(depth) {
      const moves = this._moves({ legal: false });
      let nodes = 0;
      const color = this._turn;
      for (let i = 0, len = moves.length; i < len; i++) {
        this._makeMove(moves[i]);
        if (!this._isKingAttacked(color)) {
          if (depth - 1 > 0) {
            nodes += this.perft(depth - 1);
          } else {
            nodes++;
          }
        }
        this._undoMove();
      }
      return nodes;
    }
    turn() {
      return this._turn;
    }
    board() {
      const output = [];
      let row = [];
      for (let i = Ox88.a8; i <= Ox88.h1; i++) {
        if (this._board[i] == null) {
          row.push(null);
        } else {
          row.push({
            square: algebraic(i),
            type: this._board[i].type,
            color: this._board[i].color
          });
        }
        if (i + 1 & 136) {
          output.push(row);
          row = [];
          i += 8;
        }
      }
      return output;
    }
    squareColor(square) {
      if (square in Ox88) {
        const sq = Ox88[square];
        return (rank(sq) + file(sq)) % 2 === 0 ? "light" : "dark";
      }
      return null;
    }
    history({ verbose = false } = {}) {
      const reversedHistory = [];
      const moveHistory = [];
      while (this._history.length > 0) {
        reversedHistory.push(this._undoMove());
      }
      while (true) {
        const move = reversedHistory.pop();
        if (!move) {
          break;
        }
        if (verbose) {
          moveHistory.push(new Move(this, move));
        } else {
          moveHistory.push(this._moveToSan(move, this._moves()));
        }
        this._makeMove(move);
      }
      return moveHistory;
    }
    /*
     * Keeps track of position occurrence counts for the purpose of repetition
     * checking. All three methods (`_inc`, `_dec`, and `_get`) trim the
     * irrelevent information from the fen, initialising new positions, and
     * removing old positions from the record if their counts are reduced to 0.
     */
    _getPositionCount(fen) {
      const trimmedFen = trimFen(fen);
      return this._positionCount[trimmedFen] || 0;
    }
    _incPositionCount(fen) {
      const trimmedFen = trimFen(fen);
      if (this._positionCount[trimmedFen] === void 0) {
        this._positionCount[trimmedFen] = 0;
      }
      this._positionCount[trimmedFen] += 1;
    }
    _decPositionCount(fen) {
      const trimmedFen = trimFen(fen);
      if (this._positionCount[trimmedFen] === 1) {
        delete this._positionCount[trimmedFen];
      } else {
        this._positionCount[trimmedFen] -= 1;
      }
    }
    _pruneComments() {
      const reversedHistory = [];
      const currentComments = {};
      const copyComment = (fen) => {
        if (fen in this._comments) {
          currentComments[fen] = this._comments[fen];
        }
      };
      while (this._history.length > 0) {
        reversedHistory.push(this._undoMove());
      }
      copyComment(this.fen());
      while (true) {
        const move = reversedHistory.pop();
        if (!move) {
          break;
        }
        this._makeMove(move);
        copyComment(this.fen());
      }
      this._comments = currentComments;
    }
    getComment() {
      return this._comments[this.fen()];
    }
    setComment(comment) {
      this._comments[this.fen()] = comment.replace("{", "[").replace("}", "]");
    }
    /**
     * @deprecated Renamed to `removeComment` for consistency
     */
    deleteComment() {
      return this.removeComment();
    }
    removeComment() {
      const comment = this._comments[this.fen()];
      delete this._comments[this.fen()];
      return comment;
    }
    getComments() {
      this._pruneComments();
      return Object.keys(this._comments).map((fen) => {
        return { fen, comment: this._comments[fen] };
      });
    }
    /**
     * @deprecated Renamed to `removeComments` for consistency
     */
    deleteComments() {
      return this.removeComments();
    }
    removeComments() {
      this._pruneComments();
      return Object.keys(this._comments).map((fen) => {
        const comment = this._comments[fen];
        delete this._comments[fen];
        return { fen, comment };
      });
    }
    setCastlingRights(color, rights) {
      for (const side of [KING, QUEEN]) {
        if (rights[side] !== void 0) {
          if (rights[side]) {
            this._castling[color] |= SIDES[side];
          } else {
            this._castling[color] &= ~SIDES[side];
          }
        }
      }
      this._updateCastlingRights();
      const result = this.getCastlingRights(color);
      return (rights[KING] === void 0 || rights[KING] === result[KING]) && (rights[QUEEN] === void 0 || rights[QUEEN] === result[QUEEN]);
    }
    getCastlingRights(color) {
      return {
        [KING]: (this._castling[color] & SIDES[KING]) !== 0,
        [QUEEN]: (this._castling[color] & SIDES[QUEEN]) !== 0
      };
    }
    moveNumber() {
      return this._moveNumber;
    }
  };

  // src/History.js
  function IllegalMoveException(fen, notation) {
    this.fen = fen;
    this.notation = notation;
    this.toString = function() {
      return "IllegalMoveException: " + fen + " => " + notation;
    };
  }
  var History = class {
    constructor(historyString = null, setUpFen = null, sloppy = false) {
      if (!historyString) {
        this.clear();
      } else {
        const parsedMoves = pgnParser.parse(
          historyString.replace(/\s\s+/g, " ").replace(/\n/g, " ")
        );
        this.moves = this.traverse(parsedMoves[0], setUpFen, null, 1, sloppy);
      }
      this.setUpFen = setUpFen;
    }
    clear() {
      this.moves = [];
    }
    traverse(parsedMoves, fen, parent = null, ply = 1, sloppy = false) {
      const chess = fen ? new Chess(fen) : new Chess();
      const moves = [];
      let previousMove = parent;
      for (let parsedMove of parsedMoves) {
        if (parsedMove.notation) {
          const notation = parsedMove.notation.notation;
          const move = chess.move(notation, { sloppy });
          if (move) {
            if (previousMove) {
              if (!move.previous) {
                move.previous = previousMove;
              }
              if (!previousMove.next) {
                previousMove.next = move;
              }
            } else {
              move.previous = null;
            }
            move.ply = ply;
            this.fillMoveFromChessState(move, chess);
            if (parsedMove.nag) {
              move.nag = parsedMove.nag[0];
            }
            if (parsedMove.commentBefore) {
              move.commentBefore = parsedMove.commentBefore;
            }
            if (parsedMove.commentMove) {
              move.commentMove = parsedMove.commentMove;
            }
            if (parsedMove.commentAfter) {
              move.commentAfter = parsedMove.commentAfter;
            }
            move.variations = [];
            const parsedVariations = parsedMove.variations;
            if (parsedVariations.length > 0) {
              const lastFen = moves.length > 0 ? moves[moves.length - 1].fen : fen;
              for (let parsedVariation of parsedVariations) {
                move.variations.push(this.traverse(parsedVariation, lastFen, previousMove, ply, sloppy));
              }
            }
            move.variation = moves;
            moves.push(move);
            previousMove = move;
          } else {
            throw new IllegalMoveException(chess.fen(), notation);
          }
        }
        ply++;
      }
      return moves;
    }
    fillMoveFromChessState(move, chess) {
      move.fen = chess.fen();
      move.uci = move.from + move.to + (move.promotion ? move.promotion : "");
      move.variations = [];
      if (chess.game_over()) {
        move.gameOver = true;
        if (chess.in_draw()) {
          move.inDraw = true;
        }
        if (chess.in_stalemate()) {
          move.inStalemate = true;
        }
        if (chess.insufficient_material()) {
          move.insufficientMaterial = true;
        }
        if (chess.in_threefold_repetition()) {
          move.inThreefoldRepetition = true;
        }
        if (chess.in_checkmate()) {
          move.inCheckmate = true;
        }
      }
      if (chess.in_check()) {
        move.inCheck = true;
      }
    }
    /**
     * @param move
     * @return the history to the move which may be in a variation
     */
    historyToMove(move) {
      const moves = [];
      let pointer = move;
      moves.push(pointer);
      while (pointer.previous) {
        moves.push(pointer.previous);
        pointer = pointer.previous;
      }
      return moves.reverse();
    }
    /**
     * Don't add the move, just validate, if it would be correct
     * @param notation
     * @param previous
     * @param sloppy
     * @returns {[]|{}}
     */
    validateMove(notation, previous = null, sloppy = true) {
      if (!previous) {
        if (this.moves.length > 0) {
          previous = this.moves[this.moves.length - 1];
        }
      }
      const chess = new Chess(this.setUpFen ? this.setUpFen : void 0);
      if (previous) {
        const historyToMove = this.historyToMove(previous);
        for (const moveInHistory of historyToMove) {
          chess.move(moveInHistory);
        }
      }
      const move = chess.move(notation, { sloppy });
      if (move) {
        this.fillMoveFromChessState(move, chess);
      }
      return move;
    }
    addMove(notation, previous = null, sloppy = true) {
      if (!previous) {
        if (this.moves.length > 0) {
          previous = this.moves[this.moves.length - 1];
        }
      }
      const move = this.validateMove(notation, previous, sloppy);
      if (!move) {
        throw new Error("invalid move");
      }
      move.previous = previous;
      if (previous) {
        move.ply = previous.ply + 1;
        move.uci = move.from + move.to + (move.promotion ? move.promotion : "");
        if (previous.next) {
          previous.next.variations.push([]);
          move.variation = previous.next.variations[previous.next.variations.length - 1];
          move.variation.push(move);
        } else {
          previous.next = move;
          move.variation = previous.variation;
          previous.variation.push(move);
        }
      } else {
        move.variation = this.moves;
        move.ply = 1;
        this.moves.push(move);
      }
      return move;
    }
    render(renderComments = true, renderNags = true) {
      const renderVariation = (variation, needReminder = false) => {
        let result = "";
        for (let move of variation) {
          if (move.ply % 2 === 1) {
            result += Math.floor(move.ply / 2) + 1 + ". ";
          } else if (result.length === 0 || needReminder) {
            result += move.ply / 2 + "... ";
          }
          needReminder = false;
          if (renderNags && move.nag) {
            result += "$" + move.nag + " ";
          }
          if (renderComments && move.commentBefore) {
            result += "{" + move.commentBefore + "} ";
            needReminder = true;
          }
          result += move.san + " ";
          if (renderComments && move.commentMove) {
            result += "{" + move.commentMove + "} ";
            needReminder = true;
          }
          if (renderComments && move.commentAfter) {
            result += "{" + move.commentAfter + "} ";
            needReminder = true;
          }
          if (move.variations.length > 0) {
            for (let variation2 of move.variations) {
              result += "(" + renderVariation(variation2) + ") ";
              needReminder = true;
            }
          }
          result += " ";
        }
        return result;
      };
      let ret = renderVariation(this.moves);
      ret = ret.replace(/\s+\)/g, ")");
      ret = ret.replace(/\s\s+/g, " ").trim();
      return ret;
    }
  };

  // src/Pgn.js
  var Pgn = class {
    constructor(pgnString = "", props = {}) {
      const lastHeaderElement = pgnString.trim().slice(-1) === "]" ? pgnString.length : pgnString.lastIndexOf("]\n\n") + 1;
      const headerString = pgnString.substring(0, lastHeaderElement);
      const historyString = pgnString.substring(lastHeaderElement);
      const sloppy = !!props.sloppy;
      this.header = new Header(headerString);
      if (this.header.tags[TAGS.SetUp] === "1" && this.header.tags[TAGS.FEN]) {
        this.history = new History(historyString, this.header.tags[TAGS.FEN], sloppy);
      } else {
        this.history = new History(historyString, null, sloppy);
      }
    }
    wrap(str, maxLength) {
      const words = str.split(" ");
      let lines = [];
      let line = "";
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (line.length + word.length < maxLength) {
          line += word + " ";
        } else {
          lines.push(line.trim());
          line = word + " ";
        }
      }
      lines.push(line.trim());
      return lines.join("\n");
    }
    render(renderHeader = true, renderComments = true, renderNags = true) {
      const header = renderHeader ? this.header.render() + "\n" : "";
      let history = this.history.render(renderComments, renderNags);
      if (this.header.tags[TAGS.Result]) {
        history += " " + this.header.tags[TAGS.Result];
      }
      return header + this.wrap(history, 80);
    }
  };
})();
/*! Bundled license information:

chess.js/dist/esm/chess.js:
  (**
   * @license
   * Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   *    this list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   *    this list of conditions and the following disclaimer in the documentation
   *    and/or other materials provided with the distribution.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *)
*/
