#!/bin/bash
ssh -i ~/.ssh/LightsailDefaultKey-eu-west-2.pem -L 3000:localhost:3000 bitnami@3.9.30.75
