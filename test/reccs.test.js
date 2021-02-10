const reccs = require("../routes/reccs");

describe("testing reccs.fetchApi", () => {
  let url = "";
  let callback;

  test("fetch json from a known working url", (done) => {
    url =
      "https://openlibrary.org/api/books?bibkeys=ISBN:0198239467&jscmd=data&format=json";
    options = {
      method: "get",
      headers: { "Content-Type": "application/json" },
    };
    callback = (error, result) => {
      if (error) done(error);

      try {
        expect(result).not.toBe(null);
        expect(result).toHaveProperty("ISBN:0198239467");
        expect(result["ISBN:0198239467"]["key"]).toBe("/books/OL1428682M");
        done();
      } catch (error) {
        done(error);
      }
    };

    reccs.fetchApi(url, callback);
  });

  test("fetch json from OL Subjects api", (done) => {
    url = "https://openlibrary.org/subjects/philosophy.json?limit=10";
    callback = (error, result) => {
      if (error) done(error);

      try {
        expect(result).not.toBe(null);
        expect(result).toHaveProperty("name");
        expect(result["name"]).toBe("philosophy");
        done();
      } catch (error) {
        done(error);
      }
    };

    reccs.fetchApi(url, callback);
  });

  test("fetch json from a broken url", (done) => {
    url =
      "https://openlibrary.org/api/book?bibkeys=ISBN:0198239467&jscmd=data&format=json";
    callback = (error, result) => {
      try {
        expect(result).toBe(null);
        expect(error).not.toBe(null);
        done();
      } catch (error) {
        done(error);
      }
    };

    reccs.fetchApi(url, callback);
  });
});
