jasmine.getFixtures().fixturesPath = 'base/src/ts/tests/fixtures';

describe("Question", function() {

    var dummyQuestion: DummyQuestion = null;

    beforeEach(() => {

        dummyQuestion = new DummyQuestion("Dummy");
    })

    describe("withTitle", () => {

        it("value is a string", () => {

            dummyQuestion.withTitle("Some question?");

            expect(dummyQuestion.getTitle()).not.toBeUndefined();
            expect(dummyQuestion.getTitle()).not.toBeNull();
            expect(dummyQuestion.getTitle()).toBe('Some question?');
        });

        it("value is a string callback", () => {

            dummyQuestion.withTitle(() => "Some question?");

            expect(dummyQuestion.getTitle()).not.toBeUndefined();
            expect(dummyQuestion.getTitle()).not.toBeNull();
            expect((<() => string>dummyQuestion.getTitle())()).toBe('Some question?');
        });

        it("value is an element callback", () => {

            var elem = $("<span>Some question?</span>").get(0);

            dummyQuestion.withTitle(() => elem);

            expect(dummyQuestion.getTitle()).not.toBeUndefined();
            expect(dummyQuestion.getTitle()).not.toBeNull();
            expect((<() => HTMLElement>dummyQuestion.getTitle())()).toBe(elem);
        });
    });

    describe("withDescription", () => {

        it("value is a string", () => {

            dummyQuestion.withDescription("Some question?");

            expect(dummyQuestion.getDescription()).not.toBeUndefined();
            expect(dummyQuestion.getDescription()).not.toBeNull();
            expect(dummyQuestion.getDescription()).toBe('Some question?');
        });

        it("value is a string callback", () => {

            dummyQuestion.withDescription(() => "Some question?");

            expect(dummyQuestion.getDescription()).not.toBeUndefined();
            expect(dummyQuestion.getDescription()).not.toBeNull();
            expect((<() => string>dummyQuestion.getDescription())()).toBe('Some question?');
        });

        it("value is an element callback", () => {

            var elem = $("<span>Some question?</span>").get(0);

            dummyQuestion.withDescription(() => elem);

            expect(dummyQuestion.getDescription()).not.toBeUndefined();
            expect(dummyQuestion.getDescription()).not.toBeNull();
            expect((<() => HTMLElement>dummyQuestion.getDescription())()).toBe(elem);
        });
    });

    describe("asRequired", () => {

        it("with no arguments", () => {

            dummyQuestion.asRequired();

            expect(dummyQuestion.getRequired()).not.toBeUndefined();
            expect(dummyQuestion.getRequired()).not.toBeNull();
            expect(dummyQuestion.getRequired()()).toBe(true);
        });

        it("with true argument", () => {

            dummyQuestion.asRequired(true);

            expect(dummyQuestion.getRequired()).not.toBeUndefined();
            expect(dummyQuestion.getRequired()).not.toBeNull();
            expect(dummyQuestion.getRequired()()).toBe(true);
        });

        it("with false argument", () => {

            dummyQuestion.asRequired(false);

            expect(dummyQuestion.getRequired()).not.toBeUndefined();
            expect(dummyQuestion.getRequired()).not.toBeNull();
            expect(dummyQuestion.getRequired()()).toBe(false);
        });

        it("with callback argument", () => {

            var obj = {

                someMethod: ():boolean => {

                    return null;
                }
            };

            dummyQuestion.asRequired(obj.someMethod);

            expect(dummyQuestion.getRequired()).toBe(obj.someMethod);
        });
    });

});
