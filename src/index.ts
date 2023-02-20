import which from 'which';
import { execSync } from 'child_process';
import { compare, CompareOperator } from 'compare-versions'

import{ VersionException } from './exceptions';

/**
 * @author sanghaklee
 */

const versionRegExp = new RegExp(`(?:v?(?:\\d+\\.\\d+)(?:\\.\\d+)?)`, 'g');
const versionArguments: string[] = ['-v', '--v', '-version', '--version', '-V', '--V'];

enum Operator {
    LESS = 0x02,
    GREATER = 0x04,
    EQUAL = 0x08,
}

const operators = [
    {[Operator.GREATER|Operator.EQUAL]: '>='},
    {[Operator.LESS|Operator.EQUAL]: '<='},
    {[Operator.EQUAL]: '='},
    {[Operator.GREATER]: '>'},
    {[Operator.LESS]: '<'},
];

export const { LESS, GREATER, EQUAL } = Operator;

/**
 * Get version comparison result
 * @param dependencyName dependency's name
 * @param version version to compare
 * @param op comparison operation
 * @returns boolean
 * @throws VersionException
 */
export const requires = (dependencyName: string, version: string, op: Operator): boolean => {
    const dependencyVersion = getDependencyVersion(dependencyName);
    const versionOperator = getVersionOperator(op);

    // if (dependencyVersion == "") return false;

    return compare(dependencyVersion, version, (versionOperator as CompareOperator));
}

/**
 * Get version check operator. like `<`, `>`
 * @param operator 
 * @returns operator string
 * @throws VersionException
 */
const getVersionOperator = (operator: Operator): string => {
    const find = operators.find((op) => {
      return Number(Object.keys(op)[0]) == operator;
    })
    if (!find) {
        throw new VersionException(`"${operator}" is invalid.`);
        // return "";
    }
    return Object.values(find)[0];
}

/**
 * Get dependency's version string
 * @param dependencyName dependency's name
 * @returns version (if can't bring return "")
 * @throws VersionException
 */
const getDependencyVersion = (dependencyName: string): string => {
    const binary = which.sync(dependencyName);

    for (const argument of versionArguments) {
        const versionCommand: string = `${binary} ${argument}`;

        try {
            const versionCandidate: string = execSync(versionCommand, {stdio: 'pipe'}).toString('utf8'); // stdio: 'pipe' => ignore stdio
            const isVersion: boolean = versionRegExp.test(versionCandidate);
            if (!isVersion) continue;

            const versionCandidateArray = versionCandidate.match(versionRegExp); // expect [ 'v1.8.4' ]
            if (!versionCandidateArray?.length) {
                continue;
                // return "";
                // throw new VersionException(`"${dependencyName}" version not found.`);
            }

            const onlyVersion: string = versionCandidateArray[0].trim().replace(/^v/, '').trim();
            return onlyVersion;
        } catch (error) {
            continue;
        }
    }
    // return "";
    throw new VersionException(`"${dependencyName}" version not found.`);
}