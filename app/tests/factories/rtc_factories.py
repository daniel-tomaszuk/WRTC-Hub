from faker import Faker


class RTCSessionDescriptionFactory:
    faker = Faker()

    def get_example_session_description(self) -> dict:
        example_sdp_string = self.faker.paragraph()
        example_description_type = "offer"
        return dict(sdp=example_sdp_string, type=example_description_type)
