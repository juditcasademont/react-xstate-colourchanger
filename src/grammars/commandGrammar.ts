export const grammar = `
<grammar root="order">
   <rule id="order">
      <ruleref uri="#command"/>
      <tag>out.command = new Object(); out.command.action=rules.command.type;
           out.command.object=rules.command.object;</tag>
   </rule>

   <rule id="action1">
      <one-of>
         <item>turn on<tag>out="on";</tag></item>
         <item>turn off<tag>out="off";</tag></item>
      </one-of>
   </rule>

   <rule id="action11">
      <one-of>
         <item>on<tag>out="on";</tag></item>
         <item>off<tag>out="off";</tag></item>
      </one-of>
   </rule>

   <rule id="action2">
      <one-of>
         <item>close</item>
         <item>open</item>
      </one-of>
   </rule>

   <rule id="object1">
      <one-of>
         <item>light</item>
         <item>lights</item>
         <item>heat</item>
         <item>A C<tag>out='air conditioning';</tag></item>
         <item>AC<tag>out='air conditioning';</tag></item>
         <item>air conditioning</item>
      </one-of>
   </rule>

   <rule id="object2">
      <one-of>
         <item>window</item>
         <item>door</item>
      </one-of>
   </rule>
   
   <!-- Two properties (action, object) on left hand side Rule Variable -->
   <rule id="command">
      <item repeat="0-1">please</item>

   <!-- OPTION 1 -->
      <item repeat="0-1">
      <ruleref uri="#action1"/>
      the
      <ruleref uri="#object1"/>
      <tag>out.object=rules.object1; out.type=rules.action1;</tag>
      </item>

   <!-- OPTION 1.1 -->
      <item repeat="0-1">
      turn the
      <ruleref uri="#object1"/>
      <ruleref uri="#action11"/>
      <tag>out.object=rules.object1; out.type=rules.action11;</tag>
      </item>

   <!-- OPTION 2 -->
      <item repeat="0-1">
      <ruleref uri="#action2"/>
      the
      <ruleref uri="#object2"/>
      <tag>out.object=rules.object2; out.type=rules.action2;</tag>
      </item>
   </rule>

</grammar>
`