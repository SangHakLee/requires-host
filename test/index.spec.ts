import which from 'which';
import child_process from 'child_process';

import {LESS, GREATER, EQUAL, requires} from '../src';

describe("requires", () => {
    test(`requires('node1')`, () => {
        (jest.spyOn(which, "sync") as jest.SpyInstance).mockImplementation(() => "/usr/bin/node1");

        expect(
            requires('node1')
        ).toBe(true);
    })

    test(`requires('node1', '4.0.0', EQUAL | GREATER)`, () => {
        (jest.spyOn(which, "sync") as jest.SpyInstance).mockImplementation(() => "/usr/bin/node1");
        (jest.spyOn(child_process, "execSync") as jest.SpyInstance).mockImplementation(() => "v18.14.1");

        expect(
            requires('node1', '18.14.1', EQUAL)
        ).toBe(true);
    })
});

describe("only linux", () => {
    if (process.platform === "linux") {
        // do not mock
        test(`$ man -v 
            man 2.9.1`, () => {
            expect(
                requires('man', '0.0.0', GREATER)
            ).toBe(true);
        })
    } else {
        test.skip("This test should run on Linux", () => {});
    }
});

describe("mocking", () => {
    test(`$ man -v 
        man 2.9.1`, () => {
        (jest.spyOn(which, "sync") as jest.SpyInstance).mockImplementation(() => "/usr/bin/man");
        (jest.spyOn(child_process, "execSync") as jest.SpyInstance).mockImplementation(() => "man 2.9.1");

        expect(
            requires('man', '2.9.1', EQUAL)
        ).toBe(true);

        expect(
            requires('man', '2.9.1', EQUAL | GREATER)
        ).toBe(true);
    })

    test(`when can't get version -> always throw VersionException`, () => {
        (jest.spyOn(which, "sync") as jest.SpyInstance).mockImplementation(() => "/usr/bin/man");
        (jest.spyOn(child_process, "execSync") as jest.SpyInstance).mockImplementation(() => "invalid");

        expect(() => {
            requires('man', '2.9.1', EQUAL)
        }).toThrow();

        expect(() => {
            requires('man', '2.9.1', GREATER)
        }).toThrow();

        expect(() => {
            requires('man', '2.9.1', LESS)
        }).toThrow();
    })

    test(`$ iptables-save -V
        iptables-save v1.8.4 (legacy)`, () => {
        (jest.spyOn(which, "sync") as jest.SpyInstance).mockImplementation(() => "/usr/sbin/iptables-save");
        (jest.spyOn(child_process, "execSync") as jest.SpyInstance).mockImplementation(() => "iptables-save v1.8.4 (legacy)");
        
        expect(
            requires('iptables-save', '1.8.4', EQUAL)
        ).toBe(true);

        expect(
            requires('iptables-save', '1.8.4', GREATER | EQUAL)
        ).toBe(true);

        expect(
            requires('iptables-save', '1.8.4', GREATER)
        ).toBe(false);

        expect(
            requires('iptables-save', '1.8.4', LESS)
        ).toBe(false);
    })
});