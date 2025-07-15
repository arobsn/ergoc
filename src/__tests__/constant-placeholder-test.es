{
  // bytes coll are kept as Byte[Coll] after optimization
   
   val test: Coll[Byte] = $tokenId; // @placeholder payment token id

   val byteColl: Coll[Byte] = fromBase16("fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40");
   val prices2 = Coll(100, 200, 300);

   val t: Int = 100;
   // @placeholder _deadline: Int = 101         Payment deadline
   // @placeholder _deadline_two: Int = 200

   val p: Long = price // @placeholder
   // val ps: Boolean = prices // @placeholder
   

   // use constants to get it over compiler optimizations
   sigmaProp(byteColl == test && _deadline > prices2(1) && price > p && _deadline_two > prices2(2));
}