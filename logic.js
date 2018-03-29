/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.acme.insurance.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
function setupDemo(setupDemo) {

    var factory = getFactory();
      var NS = 'org.acme.insurance';
      var now = new Date();
      // create the test
      var test = factory.newResource(NS, 'demoTest', 'testId');
      test.name = "firstTest";
      
      var bill1 = factory.newResource(NS,'bill','bill001');
      var insurance1 = factory.newResource(NS,'insurance','insurance001');
      var patient1 = factory.newResource(NS,'Patient','patient001');
      var hospital1 = factory.newResource(NS,'Hospital','hospital001');
      var insuranceCompany1 = factory.newResource(NS,'InsuranceCompany','insuranceCompany001');
      //create a bill
      bill1.cost = 500;
      bill1.illnessName = 'fever';
      bill1.date = now;
      bill1.patient = patient1;
      bill1.hospital = hospital1;
      //create a insurance
      insurance1.owner = patient1;
      insurance1.seller = insuranceCompany1;
        insurance1.validHospitalIds = new Array();
      insurance1.validHospitalIds.push('hospital001')
      insurance1.coverRate = 0.5
        //create a patient
      var patientContact = factory.newConcept(NS, 'Contact');
      patientContact.fName = "tony";
      patientContact.lname = "001";
      patientContact.email = "tony@usc.edu";
      patientContact.phone = "123";
      patient1.contact = patientContact;
  	patient1.ownedInsurance = new Array();
  	patient1.ownedInsurance.push("insurance001");
 	patient1.bills = new Array();
  	patient1.bills.push("bill001");
        patient1.Balance = 0;
      //create a Hospital
      var hospitaldContact = factory.newConcept(NS, 'Contact');
      hospitaldContact.fName = "Health Center Pharmacy";
      hospitaldContact.lname = "USC";
      hospitaldContact.email = "heal@usc.edu";
      hospitaldContact.phone = "456";
      hospital1.contact = hospitaldContact;
       hospital1.Balance = 0;
      //create a InsuranceCompany
      var insuranceContact = factory.newConcept(NS, 'Contact');
      insuranceContact.fName = "Athena";
      insuranceContact.lname = "USC";
      insuranceContact.email = "Athena@usc.edu";
      insuranceContact.phone = "789";
      insuranceCompany1.contact = insuranceContact;
        insuranceCompany1.Balance = 0;
      
      
      
       return getAssetRegistry(NS + '.demoTest')
           .then(function (demoTestRegistry) {
               // add the growers
               return demoTestRegistry.addAll([test]);
           })
          .then(function() {
              return getParticipantRegistry(NS + '.Patient');
          })
          .then(function(PatientRegistry) {
              // add the Patient
              return PatientRegistry.addAll([patient1]);
          }).then(function() {
              return getParticipantRegistry(NS + '.Hospital');
          })
          .then(function(HospitalRegistry) {
              // add the Hospital
              return HospitalRegistry.addAll([hospital1]);
          }).then(function() {
              return getParticipantRegistry(NS + '.InsuranceCompany');
          })
          .then(function(InsuranceCompanyRegistry) {
              // add the InsuranceCompany
              return InsuranceCompanyRegistry.addAll([insuranceCompany1]);
          }).then(function() {
              return getAssetRegistry(NS + '.bill');
          })
          .then(function(billRegistry) {
              // add the bill
              return billRegistry.addAll([bill1]);
          })
          .then(function() {
              return getAssetRegistry(NS + '.insurance');
          })
          .then(function(insuranceRegistry) {
              // add the insurance
              return insuranceRegistry.addAll([insurance1]);
          });
          
  }
  /* @param {org.acme.insurance.Paybill} paybill 
   * @transaction
   */
  function Paybill(paybill){
      
    var NS = 'org.acme.insurance';
    var bill = paybill.bill;
    var patient = paybill.patient;
    var hospital = paybill.hospital;
    var insurance = paybill.insurance;
    var cost = bill.cost;
    
    console.log(insurance);
    
    if(insurance){
        var coverRate = insurance.coverRate;
      var insuranceCompany = insurance.seller;
      insuranceCompany.Balance -= cost * coverRate;
      patient.Balance -= cost - cost * coverRate;
      hospital.Balance += cost;
        return getParticipantRegistry(NS + '.Patient')
          .then(function (patientRegistry) {
         
              return patientRegistry.update(patient);
          })
          .then(function() {
              return getParticipantRegistry(NS + '.Hospital');
          })
          .then(function(HospitalRegistry) {
            
              return HospitalRegistry.update(hospital);
          }).then(function() {
              return getParticipantRegistry(NS + '.InsuranceCompany');
          })
          .then(function(insuranceCompanyRegistry) {
       
              return insuranceCompanyRegistry.update(insuranceCompany);
          });
      
    } else{
      hospital.Balance += cost;
        patient.Balance -= cost;
      return getParticipantRegistry(NS + '.Patient')
          .then(function (patientRegistry) {
         
              return patientRegistry.update(patient);
          })
          .then(function() {
              return getParticipantRegistry(NS + '.Hospital');
          })
          .then(function(HospitalRegistry) {
            
              return HospitalRegistry.update(hospital);
          });
    }
    
  }

/* @param {org.acme.insurance.Createbill} createbill 
   * @transaction
   */
  function Createbill(createbill){
    	var factory = getFactory();
      var NS = 'org.acme.insurance';
      var bill1 = factory.newResource(NS,'bill',createbill.billId);
      bill1.cost = createbill.cost;
      bill1.illnessName = createbill.illnessName;
      bill1.date = new Date();
      bill1.patient = createbill.patient;
      bill1.hospital = createbill.hospital;

      if(!bill1.patient.bills) bill1.patient.bills = new Array()
      bill1.patient.bills.push(createbill.billId);

      return getAssetRegistry(NS + '.bill')
      .then(function (billRegistry) {
          // add the growers
          return billRegistry.addAll([bill1]);
      })
      .then(function() {
        return getParticipantRegistry(NS + '.Patient')
      })
     .then(function (patientRegistry) {
       
            return patientRegistry.update(bill1.patient);
      });

  	}

     /* @param {org.acme.insurance.CreateInsurance} createInsurance - the SetupDemo transaction
   * @transaction
   */
  function CreateInsurance(createInsurance){
    var factory = getFactory();
    var NS = 'org.acme.insurance';

    var insurance = factory.newResource(NS,'insurance',createInsurance.insuranceId);
    insurance.coverRate = createInsurance.coverRate;
    insurance.validHospitalIds = createInsurance.validHospitalIds;
    insurance.seller = createInsurance.seller;
    insurance.seller.Balance += createInsurance.Deposit;
    insurance.owner = createInsurance.owner;
    insurance.owner.Balance -= createInsurance.Deposit;

    if(!insurance.owner.ownedInsurance) insurance.owner.ownedInsurance = new Array()
    insurance.owner.ownedInsurance.push(createInsurance.insuranceId);

      return getAssetRegistry(NS + '.insurance')
      .then(function (insuranceRegistry) {
          // add the growers
          return insuranceRegistry.addAll([insurance]);
      })
      .then(function() {
        return getParticipantRegistry(NS + '.Patient')
      })
     .then(function (patientRegistry) {
       
            return patientRegistry.update(insurance.owner);
      })
      .then(function() {
        return getParticipantRegistry(NS + '.InsuranceCompany')
      })
     .then(function (InsuranceCompanyRegistry) {
       
            return InsuranceCompanyRegistry.update(insurance.seller);
      });

}

