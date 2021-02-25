export const grammar = `
<grammar root="funny_quote">
   <rule id="funny_quote">
      <ruleref uri="#quote"/>
      <tag>out.quote=rules.quote;</tag>
   </rule>
   <rule id="quote">
      <one-of>
         <item>to do is to be<tag>out.by="socrates";</tag></item>
         <item>to be is to do<tag>out.by="sartre";</tag></item>
         <item>do be do be do<tag>out.by="sinatra";</tag></item>
      </one-of>
   </rule>
</grammar>
`