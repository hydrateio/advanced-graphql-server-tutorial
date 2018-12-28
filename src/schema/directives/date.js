import { SchemaDirectiveVisitor } from 'graphql-tools';
import { defaultFieldResolver, GraphQLString } from 'graphql';
import { DateTime } from 'luxon';

export const typeDef = /* GraphQL */`
  directive @date(
    format: String
    timezone: String = "utc"
    locale: String = "en"
  ) on FIELD_DEFINITION
`;

class DateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const {
      timezone: defaultTimezone,
      locale: defaultLocale,
    } = this.args;

    field.args.push({
      name: 'format',
      type: GraphQLString,
      description: 'format string based on tokens defined in https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens',
    });
    field.args.push({
      name: 'timezone',
      type: GraphQLString,
      description: 'IANA timezone string (ie America/New_York). Full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones',
    });
    field.args.push({
      name: 'locale',
      type: GraphQLString,
      description: 'HTML language code for localized date formats. https://www.w3schools.com/tags/ref_language_codes.asp',
    });

    field.resolve = async (source, { format, timezone, locale, ...otherArgs }, context, info) => {
      const date = await resolve(source, otherArgs, context, info);
      const jsDate = new Date(date);
      if (!date || Number.isNaN(jsDate.getTime())) {
        return null;
      }

      const luxonDate = DateTime.fromJSDate(jsDate)
        .setLocale(locale || defaultLocale)
        .setZone(timezone || defaultTimezone);

      return format ? luxonDate.toFormat(format) : luxonDate.toISO();
    };
  }
}

export const dateDirectives = {
  date: DateDirective,
};
