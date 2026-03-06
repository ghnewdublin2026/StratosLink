#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <SparkFun_u-blox_GNSS_Arduino_Library.h>
#include <Wire.h>

SFE_UBLOX_GNSS myGNSS;
BLECharacteristic *pChar;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pS) { deviceConnected = true; };
    void onDisconnect(BLEServer* pS) { deviceConnected = false; pS->getAdvertising()->start(); }
};

void setup() {
  Wire.begin();
  if (!myGNSS.begin()) while (1); // Halt if no GNSS

  BLEDevice::init("StratosLink-Rover");
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService("181a");
  pChar = pService->createCharacteristic("2a67", BLECharacteristic::PROPERTY_NOTIFY);
  pService->start();
  pServer->getAdvertising()->start();
}

void loop() {
  if (myGNSS.getPVT() && deviceConnected) {
    float lat = myGNSS.getLatitude() / 10000000.0;
    float lon = myGNSS.getLongitude() / 10000000.0;
    float acc = myGNSS.getHorizontalAccuracy() / 1000.0;
    uint8_t siv = (uint8_t)myGNSS.getSIV();
    uint8_t fix = (uint8_t)myGNSS.getFixType();

    uint8_t pkg[14];
    memcpy(&pkg[0], &lat, 4);
    memcpy(&pkg[4], &lon, 4);
    memcpy(&pkg[8], &acc, 4);
    pkg[12] = siv;
    pkg[13] = fix;

    pChar->setValue(pkg, 14);
    pChar->notify();
  }
  delay(200);
}
