{
  // bytes coll are kept as Byte[Coll] after optimization
   val byteColl: Coll[Byte] = fromBase16("fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40");

   // nested colls are flattened 
   val nestedColl = Coll(fromBase16("deadbeef"), fromBase16("cafe1234"));

   // non-bytes coll are flattened
   val prices = Coll(1000000L, 2000000L, 3000000L);
   val prices2 = Coll(100, 200, 300);

   // tuples are flattened
   val pricesTuple = (true, 50L);
   val pricesTuple2 = (false, 10);

   // long is segregated as Long
   val price = 1000000L;
   // short is segregated as Int
   val price2: Short = 1;

   // use constants to get it over compiler optimizations
   sigmaProp(price > prices(0) || price > pricesTuple._2 || byteColl == nestedColl(0) || byteColl == nestedColl(1) || price2 == pricesTuple2._2 || price2 > prices(0));
}